const express = require('express');
const authRoutes = require('./auth');
const clubRoutes = require('./clubs');
const matchRoutes = require('./matches');
const tournamentRoutes = require('./tournaments');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'ScoreBoard API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/clubs', clubRoutes);
router.use('/matches', matchRoutes);
router.use('/tournaments', tournamentRoutes);

// 404 handler for API routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

module.exports = router;