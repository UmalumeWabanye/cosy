const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');

// Admin routes will be added here
// Properties management, requests management, users management

module.exports = router;