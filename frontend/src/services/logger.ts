/**
 * Frontend Logging Service
 * Structured logging for client-side events and errors
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  category?: string;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  stack?: string;
}

class FrontendLogger {
  private sessionId: string;
  private userId?: string;
  private logLevel: LogLevel;
  private buffer: LogEntry[] = [];
  private maxBufferSize = 100;
  private flushInterval = 30000; // 30 seconds
  private apiEndpoint = '/api/v1/logs/frontend';

  constructor() {
    this.sessionId = this.generateSessionId();
    this.logLevel = (process.env.REACT_APP_LOG_LEVEL as LogLevel) || 'info';

    // Auto-flush logs periodically
    setInterval(() => this.flush(), this.flushInterval);

    // Flush logs before page unload
    window.addEventListener('beforeunload', () => this.flush());

    // Capture unhandled errors
    this.setupErrorHandlers();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };

    return levels[level] <= levels[this.logLevel];
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    category?: string,
    metadata?: Record<string, any>,
    error?: Error
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      category,
      userId: this.userId,
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      metadata,
      stack: error?.stack
    };
  }

  private addToBuffer(entry: LogEntry): void {
    this.buffer.push(entry);

    // Console output for development
    if (process.env.NODE_ENV === 'development') {
      const style = this.getConsoleStyle(entry.level);
      console.log(
        `%c[${entry.level.toUpperCase()}] ${entry.message}`,
        style,
        entry.metadata || ''
      );
    }

    // Auto-flush if buffer is full
    if (this.buffer.length >= this.maxBufferSize) {
      this.flush();
    }
  }

  private getConsoleStyle(level: LogLevel): string {
    const styles: Record<LogLevel, string> = {
      error: 'color: #ff4444; font-weight: bold',
      warn: 'color: #ffaa00; font-weight: bold',
      info: 'color: #4444ff',
      debug: 'color: #888888'
    };
    return styles[level];
  }

  private setupErrorHandlers(): void {
    // Unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.error('Unhandled JavaScript Error', 'error-handler', {
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        message: event.message
      }, event.error);
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled Promise Rejection', 'error-handler', {
        reason: event.reason?.toString(),
        stack: event.reason?.stack
      });
    });

    // React error boundary integration
    window.addEventListener('react-error', ((event: CustomEvent) => {
      this.error('React Component Error', 'react', {
        componentStack: event.detail.componentStack,
        errorBoundary: event.detail.errorBoundary
      }, event.detail.error);
    }) as EventListener);
  }

  // Public logging methods
  public error(message: string, category?: string, metadata?: Record<string, any>, error?: Error): void {
    if (this.shouldLog('error')) {
      this.addToBuffer(this.createLogEntry('error', message, category, metadata, error));
    }
  }

  public warn(message: string, category?: string, metadata?: Record<string, any>): void {
    if (this.shouldLog('warn')) {
      this.addToBuffer(this.createLogEntry('warn', message, category, metadata));
    }
  }

  public info(message: string, category?: string, metadata?: Record<string, any>): void {
    if (this.shouldLog('info')) {
      this.addToBuffer(this.createLogEntry('info', message, category, metadata));
    }
  }

  public debug(message: string, category?: string, metadata?: Record<string, any>): void {
    if (this.shouldLog('debug')) {
      this.addToBuffer(this.createLogEntry('debug', message, category, metadata));
    }
  }

  // Specialized logging methods
  public userAction(action: string, element?: string, metadata?: Record<string, any>): void {
    this.info(`User Action: ${action}`, 'user-action', {
      action,
      element,
      ...metadata
    });
  }

  public apiCall(method: string, url: string, status: number, duration: number, error?: any): void {
    const level = status >= 400 ? 'error' : 'info';
    this[level](`API ${method} ${url}`, 'api', {
      method,
      url,
      status,
      duration: `${duration}ms`,
      ...(error && { error: error.message })
    });
  }

  public performance(metric: string, value: number, metadata?: Record<string, any>): void {
    this.info(`Performance: ${metric}`, 'performance', {
      metric,
      value,
      unit: 'ms',
      ...metadata
    });
  }

  public navigation(from: string, to: string, method: 'push' | 'replace' | 'back'): void {
    this.info('Navigation', 'navigation', {
      from,
      to,
      method,
      timestamp: Date.now()
    });
  }

  // User context management
  public setUserId(userId: string): void {
    this.userId = userId;
  }

  public clearUserId(): void {
    this.userId = undefined;
  }

  // Manual flush
  public async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const logsToSend = [...this.buffer];
    this.buffer = [];

    try {
      // Send logs to backend
      await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs: logsToSend }),
        // Don't include credentials to avoid CORS issues for logging
      });
    } catch (error) {
      // Re-add logs to buffer if send failed
      this.buffer.unshift(...logsToSend);

      // Only log to console in development to avoid infinite loops
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to send logs to server:', error);
      }
    }
  }

  // Get current session info
  public getSessionInfo() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };
  }
}

// Create singleton instance
const logger = new FrontendLogger();

// Export convenience functions
export const log = {
  error: (message: string, category?: string, metadata?: Record<string, any>, error?: Error) =>
    logger.error(message, category, metadata, error),

  warn: (message: string, category?: string, metadata?: Record<string, any>) =>
    logger.warn(message, category, metadata),

  info: (message: string, category?: string, metadata?: Record<string, any>) =>
    logger.info(message, category, metadata),

  debug: (message: string, category?: string, metadata?: Record<string, any>) =>
    logger.debug(message, category, metadata),

  userAction: (action: string, element?: string, metadata?: Record<string, any>) =>
    logger.userAction(action, element, metadata),

  apiCall: (method: string, url: string, status: number, duration: number, error?: any) =>
    logger.apiCall(method, url, status, duration, error),

  performance: (metric: string, value: number, metadata?: Record<string, any>) =>
    logger.performance(metric, value, metadata),

  navigation: (from: string, to: string, method: 'push' | 'replace' | 'back') =>
    logger.navigation(from, to, method),

  setUserId: (userId: string) => logger.setUserId(userId),
  clearUserId: () => logger.clearUserId(),
  flush: () => logger.flush(),
  getSessionInfo: () => logger.getSessionInfo()
};

export default logger;