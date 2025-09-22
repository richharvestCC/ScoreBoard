# 📊 ScoreBoard Logging System Guide

Complete guide for the enhanced structured logging system with correlation tracking and performance monitoring.

## 🏗️ System Overview

### Backend Logging
- **Winston-based** structured logging with JSON format
- **Correlation ID** tracking across requests
- **Context-aware** logging with async hooks
- **Multiple log levels** and specialized categories
- **Production-ready** file rotation and performance logs

### Frontend Logging
- **Client-side** error tracking and user action logging
- **Automatic** error capture and performance metrics
- **Session tracking** with correlation to backend logs
- **Buffer-based** log transmission to backend

## 📋 Backend Logging Usage

### Basic Logging
```javascript
const { log } = require('../config/logger');

// Standard logging with automatic context
log.info('User logged in successfully');
log.warn('Rate limit approaching', { limit: 100, current: 95 });
log.error('Database connection failed', { error: error.message });
log.debug('Cache hit', { key: 'user:123', ttl: 300 });
```

### HTTP Request Logging
```javascript
// Automatic via middleware (already configured)
// Includes correlation ID, user ID, response time, status codes
// Example output: [INFO][a1b2c3d4][user:123]: HTTP Request | {"method":"GET","url":"/api/users","statusCode":200}
```

### Database Operation Logging
```javascript
const startTime = Date.now();
try {
  const user = await User.findByPk(userId);
  const duration = Date.now() - startTime;
  log.database('SELECT', 'Users', duration, null, { userId });
} catch (error) {
  const duration = Date.now() - startTime;
  log.database('SELECT', 'Users', duration, error, { userId });
}
```

### Security Event Logging
```javascript
const { security } = require('../config/logger');

// Shortcut methods for common security events
security.authFailure({ userId, ip: req.ip, reason: 'invalid_password' });
security.authSuccess({ userId, ip: req.ip });
security.unauthorized({ userId, resource: '/admin', ip: req.ip });
security.suspiciousActivity({ pattern: 'multiple_failures', ip: req.ip });
security.dataAccess({ userId, resource: 'sensitive_data', action: 'read' });

// Custom security events
log.security('password_reset_requested', 'medium', {
  userId,
  ip: req.ip,
  email: user.email
});
```

### Performance Monitoring
```javascript
// Manual performance logging
const start = Date.now();
const result = await expensiveOperation();
const duration = Date.now() - start;
log.performance('expensive_operation', duration, {
  recordCount: result.length
});

// Using decorator (advanced)
const { timeOperation } = require('../config/logger');

class UserService {
  @timeOperation('user_creation')
  async createUser(userData) {
    // Method automatically timed and logged
    return await User.create(userData);
  }
}
```

### Business Logic Events
```javascript
// Track important business events
log.business('match_created', 'Match', {
  matchId: match.id,
  homeClub: match.homeClub,
  awayClub: match.awayClub,
  tournament: match.tournamentId
});

log.business('tournament_started', 'Tournament', {
  tournamentId: tournament.id,
  participantCount: tournament.participants.length,
  format: tournament.format
});
```

### WebSocket Event Logging
```javascript
// Socket.io events (already integrated)
io.on('connection', (socket) => {
  log.socket('user_connected', socket.id, { userId: socket.userId });

  socket.on('join-match', (matchId) => {
    log.socket('join_match', socket.id, { matchId, userId: socket.userId });
  });
});
```

## 🖥️ Frontend Logging Usage

### Basic Client Logging
```typescript
import { log } from '../services/logger';

// Basic logging
log.info('Component mounted', 'react', { component: 'Dashboard' });
log.warn('API response delayed', 'api', { endpoint: '/matches', delay: 2000 });
log.error('Form validation failed', 'validation', { errors }, validationError);

// Set user context
log.setUserId(user.id);
```

### User Action Tracking
```typescript
// Track user interactions
log.userAction('button_click', 'submit_match_score', {
  matchId: match.id,
  scoreHome: homeScore,
  scoreAway: awayScore
});

log.userAction('navigation', 'clubs_page', { from: 'dashboard' });
log.userAction('form_submit', 'create_tournament', { format: 'knockout' });
```

### API Call Monitoring
```typescript
// Automatic API logging (integrate with axios interceptor)
axios.interceptors.response.use(
  (response) => {
    const duration = Date.now() - response.config.metadata.startTime;
    log.apiCall(
      response.config.method.toUpperCase(),
      response.config.url,
      response.status,
      duration
    );
    return response;
  },
  (error) => {
    const duration = Date.now() - error.config.metadata.startTime;
    log.apiCall(
      error.config.method.toUpperCase(),
      error.config.url,
      error.response?.status || 0,
      duration,
      error
    );
    return Promise.reject(error);
  }
);
```

### Performance Metrics
```typescript
// Component render performance
useEffect(() => {
  const start = performance.now();

  // Heavy component operation
  processLargeDataset();

  const duration = performance.now() - start;
  log.performance('large_dataset_processing', duration, {
    component: 'MatchStatistics',
    recordCount: dataset.length
  });
}, [dataset]);

// Page load metrics
window.addEventListener('load', () => {
  const navigation = performance.getEntriesByType('navigation')[0];
  log.performance('page_load', navigation.loadEventEnd - navigation.fetchStart, {
    page: window.location.pathname
  });
});
```

### Error Boundaries Integration
```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Trigger custom event for logger
    window.dispatchEvent(new CustomEvent('react-error', {
      detail: {
        error,
        componentStack: errorInfo.componentStack,
        errorBoundary: this.constructor.name
      }
    }));
  }
}
```

## 📊 Log Categories and Structure

### Log Categories
| Category | Purpose | Examples |
|----------|---------|----------|
| `http-access` | HTTP request/response | Request methods, status codes, response times |
| `database` | Database operations | Queries, connections, transactions |
| `security` | Security events | Auth failures, unauthorized access |
| `performance` | Performance metrics | Slow operations, resource usage |
| `business` | Business logic events | Match creation, tournament start |
| `websocket` | WebSocket events | Connections, room joins, real-time events |
| `user-action` | Frontend user actions | Clicks, navigation, form submissions |
| `api` | API call tracking | Frontend to backend communication |
| `react` | React component events | Renders, errors, lifecycle |
| `validation` | Input validation | Form errors, data validation |

### Log Levels
| Level | Usage | Output |
|-------|-------|--------|
| `error` | Errors requiring attention | Console + error.log |
| `warn` | Warnings and potential issues | Console + combined.log |
| `info` | General information | Console + combined.log |
| `debug` | Detailed debugging info | Console only (dev mode) |

## 🔧 Configuration

### Environment Variables
```bash
# Backend
LOG_LEVEL=info                    # debug, info, warn, error
LOG_DIR=/var/log/scoreboard      # Production log directory
NODE_ENV=production              # Enables file logging

# Frontend
REACT_APP_LOG_LEVEL=info         # Client-side log level
```

### Log File Structure (Production)
```
logs/
├── combined.log         # All logs in JSON format
├── error.log           # Error-level logs only
├── security.log        # Security events (warn+ level)
└── performance.log     # Performance metrics
```

### Correlation ID Tracking
Every request gets a unique correlation ID that appears in all related logs:
```
2024-01-22 10:30:15 [INFO][a1b2c3d4][user:123]: HTTP Request | {"method":"POST","url":"/api/matches"}
2024-01-22 10:30:15 [DEBUG][a1b2c3d4][user:123]: Database Operation: INSERT on Matches | {"duration":"45ms"}
2024-01-22 10:30:16 [INFO][a1b2c3d4][user:123]: Business Event: match_created
```

## 🚨 Monitoring and Alerts

### Key Metrics to Monitor
1. **Error Rate**: Percentage of 4xx/5xx responses
2. **Response Time**: 95th percentile API response times
3. **Database Performance**: Query execution times
4. **Security Events**: Failed authentication attempts
5. **Business Metrics**: Match creation rate, user activity

### Log Analysis Queries
```bash
# Find all errors for a specific user
grep '"userId":"123"' logs/error.log

# Monitor slow database operations
grep '"category":"database"' logs/combined.log | grep '"duration":"[0-9]\{4,\}'

# Security events from specific IP
grep '"ip":"192.168.1.100"' logs/security.log

# API response time analysis
grep '"category":"http-access"' logs/combined.log | grep '"responseTime"'
```

## 🔍 Troubleshooting

### Common Issues

**High Log Volume**
- Increase log level to `warn` or `error`
- Implement log sampling for high-traffic endpoints
- Monitor log file sizes and rotation

**Missing Correlation IDs**
- Ensure correlation middleware is applied before other middleware
- Check async context is properly maintained

**Frontend Logs Not Appearing**
- Verify backend endpoint `/api/v1/logs/frontend` exists
- Check CORS configuration for log endpoint
- Monitor network requests in browser dev tools

**Performance Impact**
- Use async logging for high-throughput scenarios
- Consider log buffering and batch processing
- Monitor log processing overhead

### Debug Mode
```javascript
// Enable debug logging temporarily
log.debug('Detailed state information', 'debug', {
  requestBody: req.body,
  queryParams: req.query,
  userAgent: req.get('User-Agent')
});
```

---

💡 **Best Practices**: Always include relevant context in logs, use consistent naming conventions, and regularly review log retention policies for storage management.