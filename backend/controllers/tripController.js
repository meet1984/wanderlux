// controllers/tripController.js — Trip CRUD + AI generation
const { pool } = require('../config/db');
const { generateItinerary } = require('../utils/geminiService');
const { generateItineraryPDF } = require('../utils/pdfGenerator');

const PAGE_SIZE = 9;

/**
 * POST /api/trips — Generate a new AI itinerary
 */
const createTrip = async (req, res) => {
  let tripId = null;

  try {
    const { destination, days, preferences = {} } = req.body;
    const userId = req.user.id;

    if (!destination || !days) {
      return res.status(400).json({ error: 'Destination and days are required' });
    }
    if (days < 1 || days > 30) {
      return res.status(400).json({ error: 'Days must be between 1 and 30' });
    }

    // Insert pending trip record
    const [tripResult] = await pool.query(
      'INSERT INTO trips (user_id, destination, days, preferences, status) VALUES (?, ?, ?, ?, ?)',
      [userId, destination.trim(), days, JSON.stringify(preferences), 'generating']
    );
    tripId = tripResult.insertId;

    // Call Gemini AI
    const { itinerary, tokensUsed } = await generateItinerary(destination, days, preferences);
    console.log("Calling Gemini...");
    const result = await generateItinerary(destination, days, preferences);
    console.log("Gemini result:", result); 
    // Save itinerary
    await pool.query(
      'INSERT INTO itineraries (trip_id, itinerary_data, tokens_used) VALUES (?, ?, ?)',
      [tripId, JSON.stringify(itinerary), tokensUsed]
    );

    // Mark trip as completed
    await pool.query(
      "UPDATE trips SET status = 'completed' WHERE id = ?",
      [tripId]
    );

    res.status(201).json({
      message: 'Itinerary generated successfully',
      trip: { id: tripId, destination, days, preferences, status: 'completed' },
      itinerary,
    });
    } catch (err) {
    console.error('CreateTrip error:', {
      message: err.message,
      stack: err.stack,
    });

    // Mark failed if trip was created
    if (tripId) {
      await pool.query("UPDATE trips SET status = 'failed' WHERE id = ?", [tripId]).catch(() => {});
    }

    const isAIError = err.message?.includes('API') || err.message?.includes('JSON');
    res.status(isAIError ? 502 : 500).json({
      error: isAIError
        ? 'AI service temporarily unavailable. Please try again.'
        : 'Failed to generate itinerary',
    });
  }
};

/**
 * GET /api/trips — Paginated list of user's trips
 */
const getTrips = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const offset = (page - 1) * PAGE_SIZE;

    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM trips WHERE user_id = ? AND status != 'failed'",
      [userId]
    );

    const [rows] = await pool.query(
      `SELECT t.id, t.destination, t.days, t.preferences, t.status, t.created_at,
              i.id AS itinerary_id,
              JSON_EXTRACT(i.itinerary_data, '$.summary') AS summary,
              JSON_EXTRACT(i.itinerary_data, '$.country') AS country
       FROM trips t
       LEFT JOIN itineraries i ON i.trip_id = t.id
       WHERE t.user_id = ? AND t.status != 'failed'
       ORDER BY t.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, PAGE_SIZE, offset]
    );

    res.json({
      trips: rows.map(r => ({
        ...r,
        summary: r.summary ? r.summary.replace(/^"|"$/g, '') : null,
        country: r.country ? r.country.replace(/^"|"$/g, '') : null,
      })),
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        total: parseInt(total),
        totalPages: Math.ceil(total / PAGE_SIZE),
      },
    });
  } catch (err) {
    console.error('GetTrips error:', err);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
};

/**
 * GET /api/trips/:id — Single trip with full itinerary
 */
const getTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT t.*, i.itinerary_data, i.created_at AS itinerary_created_at
       FROM trips t
       LEFT JOIN itineraries i ON i.trip_id = t.id
       WHERE t.id = ? AND t.user_id = ?`,
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const row = rows[0];
    res.json({
      trip: {
        id: row.id,
        destination: row.destination,
        days: row.days,
        preferences: row.preferences,
        status: row.status,
        created_at: row.created_at,
      },
      itinerary: row.itinerary_data,
    });
  } catch (err) {
    console.error('GetTrip error:', err);
    res.status(500).json({ error: 'Failed to fetch trip' });
  }
};

/**
 * DELETE /api/trips/:id — Delete a trip
 */
const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [result] = await pool.query(
      'DELETE FROM trips WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.json({ message: 'Trip deleted successfully' });
  } catch (err) {
    console.error('DeleteTrip error:', err);
    res.status(500).json({ error: 'Failed to delete trip' });
  }
};

/**
 * POST /api/trips/:id/regenerate — Regenerate itinerary for existing trip
 */
const regenerateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [rows] = await pool.query(
      'SELECT * FROM trips WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const trip = rows[0];

    await pool.query("UPDATE trips SET status = 'generating' WHERE id = ?", [id]);

    const { itinerary, tokensUsed } = await generateItinerary(
      trip.destination,
      trip.days,
      trip.preferences || {}
    );

    // Upsert itinerary
    await pool.query(
      `INSERT INTO itineraries (trip_id, itinerary_data, tokens_used)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE itinerary_data = VALUES(itinerary_data),
                               tokens_used = VALUES(tokens_used),
                               updated_at = CURRENT_TIMESTAMP`,
      [id, JSON.stringify(itinerary), tokensUsed]
    );

    await pool.query("UPDATE trips SET status = 'completed', updated_at = NOW() WHERE id = ?", [id]);

    res.json({ message: 'Itinerary regenerated', itinerary });
  } catch (err) {
    console.error('RegenerateTrip error:', err);
    res.status(500).json({ error: 'Failed to regenerate itinerary' });
  }
};

/**
 * GET /api/trips/:id/pdf — Download itinerary as PDF
 */
const downloadPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT t.*, i.itinerary_data
       FROM trips t
       JOIN itineraries i ON i.trip_id = t.id
       WHERE t.id = ? AND t.user_id = ?`,
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found or itinerary not available' });
    }

    const { itinerary_data, ...trip } = rows[0];
    const itinerary = itinerary_data;

    const pdfBuffer = await generateItineraryPDF(trip, itinerary);

    const filename = `WanderLux-${trip.destination.replace(/[^a-z0-9]/gi, '-')}-${trip.days}days.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (err) {
    console.error('DownloadPDF error:', err);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
};

module.exports = { createTrip, getTrips, getTrip, deleteTrip, regenerateTrip, downloadPDF };
