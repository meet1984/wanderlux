// routes/auth.js
const router = require('express').Router();
const { register, login, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { registerRules, loginRules, handleValidationErrors } = require('../middleware/validate');

router.post('/register', registerRules, handleValidationErrors, register);
router.post('/login',    loginRules,    handleValidationErrors, login);
router.get('/me',        authenticate,  getMe);

module.exports = router;
