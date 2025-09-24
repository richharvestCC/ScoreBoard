const express = require('express');
const { log } = require('../config/logger');

const router = express.Router();

/**
 * Frontend Logs Collection Endpoint
 * Receives structured logs from frontend applications
 */
router.post('/frontend', (req, res) => {
  try {
    const { logs } = req.body;

    if (!logs || !Array.isArray(logs)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid logs format. Expected array of log entries.'
      });
    }

    // Process each log entry from frontend
    logs.forEach(logEntry => {
      const {
        timestamp,
        level,
        message,
        category,
        userId,
        sessionId,
        url,
        userAgent,
        metadata,
        stack
      } = logEntry;

      // Create structured log data
      const frontendLogData = {
        source: 'frontend',
        category: category || 'general',
        sessionId,
        userId,
        url,
        userAgent,
        metadata,
        ...(stack && { stack }),
        timestamp: timestamp || new Date().toISOString()
      };

      // Route to appropriate log level
      switch (level) {
        case 'error':
          log.error(`Frontend Error: ${message}`, frontendLogData);
          break;
        case 'warn':
          log.warn(`Frontend Warning: ${message}`, frontendLogData);
          break;
        case 'info':
          log.info(`Frontend Info: ${message}`, frontendLogData);
          break;
        case 'debug':
          log.debug(`Frontend Debug: ${message}`, frontendLogData);
          break;
        default:
          log.info(`Frontend Log: ${message}`, frontendLogData);
      }
    });

    // Send success response
    res.json({
      success: true,
      message: `Processed ${logs.length} log entries`,
      processedCount: logs.length
    });

  } catch (error) {
    log.error('Frontend logs processing failed', {
      error: error.message,
      stack: error.stack,
      source: 'frontend-logs-endpoint'
    });

    res.status(500).json({
      success: false,
      message: 'Failed to process frontend logs'
    });
  }
});

module.exports = router;