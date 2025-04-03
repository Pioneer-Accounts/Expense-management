const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Register a new user
router.post('/signup', authController.signup);

// Login user
router.post('/signin', authController.signin);

// Get current user (protected route)
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;