const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

// Import modules
const { testConnection, syncDatabase } = require('./models');
const routes = require('./routes');
const { logger, log } = require('./config/logger');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(morgan('combined'));

// CORS configuration
const corsOptions = {
  origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/v1', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'ScoreBoard API Server',
    version: '1.0.0',
    documentation: '/api/v1/health'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  log.error('Global error handler', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method
  });

  res.status(error.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : error.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  log.socket('user_connected', socket.id);

  // Join match room
  socket.on('join-match', (matchId) => {
    socket.join(`match-${matchId}`);
    log.socket('join_match', socket.id, { matchId });
  });

  // Leave match room
  socket.on('leave-match', (matchId) => {
    socket.leave(`match-${matchId}`);
    log.socket('leave_match', socket.id, { matchId });
  });

  socket.on('disconnect', () => {
    log.socket('user_disconnected', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  let dbConnected = false;

  try {
    // Test database connection with retries
    log.info('📡 Attempting to connect to database...');
    await testConnection(3, 5000);
    dbConnected = true;

    // Sync database models only if connected
    log.info('🔄 Synchronizing database models...');
    await syncDatabase();

  } catch (error) {
    log.error('⚠️ Database connection failed during startup', {
      error: error.message,
      code: error.code,
      errno: error.errno
    });

    // Continue without database in development mode for graceful degradation
    if (process.env.NODE_ENV !== 'production') {
      log.warn('🔧 Running in development mode without database - some features will be unavailable');
      log.warn('💡 Please ensure PostgreSQL is running and configured correctly');
    } else {
      log.error('💥 Database is required in production mode. Server cannot start.');
      process.exit(1);
    }
  }

  try {
    // Start server regardless of database status
    server.listen(PORT, () => {
      log.info(`🚀 ScoreBoard API Server running on port ${PORT}`);
      log.info(`📍 Server URL: http://localhost:${PORT}`);
      log.info(`🔗 API Docs: http://localhost:${PORT}/api/v1/health`);
      log.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      log.info(`💾 Database Status: ${dbConnected ? '✅ Connected' : '❌ Disconnected'}`);

      // Set up periodic database health checks if initial connection failed
      if (!dbConnected) {
        setupDatabaseHealthCheck();
      }
    });
  } catch (error) {
    log.error('❌ Failed to start HTTP server', { error: error.message, stack: error.stack });
    process.exit(1);
  }
};

// Periodic database health check and reconnection
const setupDatabaseHealthCheck = () => {
  const healthCheckInterval = 30000; // 30 seconds

  setInterval(async () => {
    const { checkConnectionHealth } = require('./models');
    const health = await checkConnectionHealth();

    if (health.healthy) {
      log.info('🔄 Database reconnected successfully');
      clearInterval(this); // Stop health checks once reconnected
    } else {
      log.warn('💔 Database still unavailable', { error: health.error });
    }
  }, healthCheckInterval);
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  log.info('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    log.info('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  log.info('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    log.info('✅ Server closed');
    process.exit(0);
  });
});

startServer();

module.exports = { app, server, io };