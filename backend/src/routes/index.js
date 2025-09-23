const express = require('express');
const authRoutes = require('./auth');
const clubRoutes = require('./clubs');
const matchRoutes = require('./matches');
const tournamentRoutes = require('./tournaments');
const competitionRoutes = require('./competitions');
const adminRoutes = require('./admin');
const matchSchedulingRoutes = require('./matchScheduling');
const liveScoringRoutes = require('./liveScoring');
const leagueRoutes = require('./leagues');

const router = express.Router();

// Enhanced health check endpoint with database status
router.get('/health', async (req, res) => {
  const { checkConnectionHealth } = require('../models');

  try {
    const dbHealth = await checkConnectionHealth();
    const status = dbHealth.healthy ? 'healthy' : 'degraded';
    const httpCode = dbHealth.healthy ? 200 : 503;

    res.status(httpCode).json({
      success: true,
      status: status,
      message: 'ScoreBoard API Health Check',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        api: 'healthy',
        database: dbHealth.healthy ? 'healthy' : 'unhealthy',
        ...(dbHealth.error && { database_error: dbHealth.error })
      },
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      message: 'Health check failed',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// API routes
router.use('/auth', authRoutes);
router.use('/clubs', clubRoutes);
router.use('/competitions', competitionRoutes);
router.use('/matches', matchRoutes);
router.use('/tournaments', tournamentRoutes);
router.use('/admin', adminRoutes);
router.use('/scheduling', matchSchedulingRoutes);
router.use('/live', liveScoringRoutes);
router.use('/leagues', leagueRoutes);

// 404 handler for API routes
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

module.exports = router;