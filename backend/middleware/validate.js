// middleware/validate.js — Input sanitization helpers
const { body, validationResult } = require('express-validator');

// Reusable error response for validation failures
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// Auth validators
const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name too long'),
  body('email')
    .trim()
    .isEmail().withMessage('Valid email required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .isLength({ max: 128 }).withMessage('Password too long'),
];

const loginRules = [
  body('email').trim().isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password required'),
];

// Trip validators
const tripRules = [
  body('destination')
    .trim()
    .notEmpty().withMessage('Destination is required')
    .isLength({ max: 255 }).withMessage('Destination too long')
    .escape(),
  body('days')
    .isInt({ min: 1, max: 30 }).withMessage('Days must be between 1 and 30'),
  body('preferences')
    .optional()
    .isObject().withMessage('Preferences must be an object'),
  body('preferences.budget')
    .optional()
    .isIn(['budget', 'moderate', 'luxury']).withMessage('Invalid budget value'),
  body('preferences.travelStyle')
    .optional()
    .isIn(['relaxed', 'balanced', 'packed']).withMessage('Invalid travel style'),
  body('preferences.interests')
    .optional()
    .isArray({ max: 10 }).withMessage('Too many interests'),
];

module.exports = {
  handleValidationErrors,
  registerRules,
  loginRules,
  tripRules,
};
