const createDOMPurify = require('isomorphic-dompurify');
const { JSDOM } = require('jsdom');
const validator = require('validator');

// Create a window object for server-side HTML sanitization
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param {string} dirty - The potentially unsafe HTML string
 * @param {Object} options - DOMPurify configuration options
 * @returns {string} - Sanitized safe HTML string
 */
function sanitizeHtml(dirty, options = {}) {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  // Default configuration for text fields - strips all HTML tags
  const defaultConfig = {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    STRIP_COMMENTS: true,
    SANITIZE_DOM: true
  };

  const config = { ...defaultConfig, ...options };

  return DOMPurify.sanitize(dirty, config);
}

/**
 * Sanitizes rich text content allowing safe HTML tags
 * @param {string} dirty - The potentially unsafe HTML string
 * @returns {string} - Sanitized HTML string with safe tags preserved
 */
function sanitizeRichText(dirty) {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  // Allow safe HTML tags for rich text content
  const richTextConfig = {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
    STRIP_COMMENTS: true,
    SANITIZE_DOM: true
  };

  return DOMPurify.sanitize(dirty, richTextConfig);
}

/**
 * Validates and sanitizes text input for database storage
 * @param {string} input - User input text
 * @param {Object} options - Validation options
 * @returns {Object} - {isValid: boolean, sanitized: string, error?: string}
 */
function sanitizeAndValidateText(input, options = {}) {
  const { maxLength = 5000, allowRichText = false } = options;

  if (!input) {
    return { isValid: true, sanitized: '' };
  }

  if (typeof input !== 'string') {
    return { isValid: false, sanitized: '', error: 'Input must be a string' };
  }

  // Check length before sanitization
  if (input.length > maxLength) {
    return {
      isValid: false,
      sanitized: '',
      error: `Text length exceeds maximum of ${maxLength} characters`
    };
  }

  // Sanitize the input
  const sanitized = allowRichText ? sanitizeRichText(input) : sanitizeHtml(input);

  // Additional validation after sanitization
  if (sanitized.length > maxLength) {
    return {
      isValid: false,
      sanitized: '',
      error: `Sanitized text length exceeds maximum of ${maxLength} characters`
    };
  }

  return { isValid: true, sanitized };
}

/**
 * Middleware to sanitize request body fields
 * @param {Array} fields - Array of field names to sanitize
 * @param {Object} options - Sanitization options per field
 * @returns {Function} - Express middleware function
 */
function sanitizeFields(fields, options = {}) {
  return (req, res, next) => {
    if (!req.body) {
      return next();
    }

    const errors = [];

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        const fieldOptions = options[field] || {};
        const result = sanitizeAndValidateText(req.body[field], fieldOptions);

        if (!result.isValid) {
          errors.push(`${field}: ${result.error}`);
        } else {
          req.body[field] = result.sanitized;
        }
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    next();
  };
}

module.exports = {
  sanitizeHtml,
  sanitizeRichText,
  sanitizeAndValidateText,
  sanitizeFields
};