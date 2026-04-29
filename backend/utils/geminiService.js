// utils/geminiService.js — FINAL (WORKING WITH YOUR MODEL)

const axios = require("axios");

function buildPrompt(destination, days, preferences = {}) {
  const { budget = 'moderate', interests = [], travelStyle = 'balanced' } = preferences;

  const interestStr = interests.length > 0
    ? `Interests: ${interests.join(', ')}.`
    : '';

  return `You are an expert travel planner. Generate a detailed ${days}-day itinerary for ${destination}.

Budget: ${budget}
Style: ${travelStyle}
${interestStr}

Return ONLY valid JSON.`;
}

// 🔁 Retry helper
async function callGemini(url, body, retries = 3) {
  try {
    return await axios.post(url, body);
  } catch (err) {
    const status = err.response?.status;

    if ((status === 503 || status === 429) && retries > 0) {
      console.log(`Retrying... (${retries} left)`);
      await new Promise(res => setTimeout(res, 2000));
      return callGemini(url, body, retries - 1);
    }

    throw err;
  }
}

async function generateItinerary(destination, days, preferences = {}) {
  try {
    const prompt = buildPrompt(destination, days, preferences);

    const body = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    };

    // ✅ YOUR WORKING MODEL
    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_GEMINI_API_KEY}`;

    const res = await callGemini(url, body);

    const text =
      res.data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const cleaned = text
      .replace(/```json\n?/gi, "")
      .replace(/```\n?/gi, "")
      .trim();

    let itinerary;

    try {
      itinerary = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        itinerary = JSON.parse(match[0]);
      } else {
        console.error("RAW AI:", cleaned);
        throw new Error("JSON_PARSE_ERROR");
      }
    }

    return {
      itinerary,
      tokensUsed: res.data.usageMetadata?.totalTokenCount || 0,
    };

  } catch (err) {
    console.error("Gemini Error:", err.response?.data || err.message);
    throw err;
  }
}

module.exports = { generateItinerary };