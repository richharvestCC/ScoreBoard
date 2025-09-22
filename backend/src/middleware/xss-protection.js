const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { sanitizeFields } = require('../utils/sanitizer');

/**
 * Comprehensive XSS and security protection middleware
 */
const xssProtection = {
  // Enhanced helmet configuration with XSS protection
  helmetConfig: helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "ws:", "wss:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: false, // May be needed for some functionality
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }),

  // Rate limiting to prevent automated attacks
  rateLimiting: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip successful requests for static resources
    skip: (req, res) => res.statusCode < 400
  }),

  // Specific rate limiting for text input endpoints
  textInputRateLimit: rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20, // Limit to 20 text submissions per minute
    message: {
      success: false,
      message: 'Too many text submissions, please slow down',
      retryAfter: '1 minute'
    }
  }),

  // Sanitization middleware for common vulnerable fields
  sanitizeCommonFields: sanitizeFields(
    ['notes', 'description', 'prize_description', 'rules', 'comment'],
    {
      notes: { maxLength: 2000 },
      description: { maxLength: 3000, allowRichText: true },
      prize_description: { maxLength: 1500, allowRichText: true },
      rules: { maxLength: 5000, allowRichText: true },
      comment: { maxLength: 1000 }
    }
  ),

  // JSON body parser with size limits to prevent DoS
  jsonParserLimits: {
    limit: '1mb', // Limit JSON payload size
    strict: true,  // Only parse arrays and objects
    verify: (req, res, buf, encoding) => {
      // Additional verification for JSON content
      if (buf && buf.length > 0) {
        const bodyStr = buf.toString(encoding || 'utf8');
        // Check for suspicious patterns
        const lowerBodyStr = bodyStr.toLowerCase();
        if (lowerBodyStr.includes('<script') || lowerBodyStr.includes('javascript:') || lowerBodyStr.includes('vbscript:')) {
          const error = new Error('Suspicious content detected');
          error.status = 400;
          throw error;
        }
      }
    }
  },

  // Headers to prevent XSS and other attacks
  securityHeaders: (req, res, next) => {
    // Note: X-XSS-Protection header is deprecated and removed for security

    // Prevent content type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Remove server information
    res.removeHeader('X-Powered-By');

    next();
  },

  // Request validation middleware
  requestValidation: (req, res, next) => {
    // Validate Content-Type for POST/PUT requests
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const contentType = req.get('Content-Type');
      if (contentType && !contentType.includes('application/json')) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Content-Type. Only application/json is supported'
        });
      }
    }

    // Check for suspicious headers
    const suspiciousHeaders = ['x-forwarded-proto', 'x-real-ip'];
    for (const header of suspiciousHeaders) {
      const value = req.get(header);
      if (value && (value.toLowerCase().includes('<') || value.toLowerCase().includes('script'))) {
        return res.status(400).json({
          success: false,
          message: 'Suspicious header detected'
        });
      }
    }

    next();
  },

  // Error handler for XSS-related errors
  xssErrorHandler: (error, req, res, next) => {
    if (error.message && error.message.includes('unsafe content')) {
      return res.status(400).json({
        success: false,
        message: 'Content contains potentially unsafe elements',
        error: 'XSS_PROTECTION_VIOLATION'
      });
    }

    if (error.message && error.message.includes('Suspicious content')) {
      return res.status(400).json({
        success: false,
        message: 'Request contains suspicious content',
        error: 'SUSPICIOUS_CONTENT_DETECTED'
      });
    }

    next(error);
  }
};

module.exports = xssProtection;