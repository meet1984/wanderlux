// routes/trips.js
const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { tripRules, handleValidationErrors } = require('../middleware/validate');
const {
  createTrip,
  getTrips,
  getTrip,
  deleteTrip,
  regenerateTrip,
  downloadPDF,
} = require('../controllers/tripController');

// All trip routes require authentication
router.use(authenticate);

router.post('/',               tripRules, handleValidationErrors, createTrip);
router.get('/',                getTrips);
router.get('/:id',             getTrip);
router.delete('/:id',          deleteTrip);
router.post('/:id/regenerate', regenerateTrip);
router.get('/:id/pdf',         downloadPDF);

module.exports = router;
