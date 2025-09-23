/**
 * XSS Protection Utilities
 * Client-side sanitization for user-generated content
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'u', 's', 'br', 'p', 'div', 'span',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'a', 'img'
    ],
    ALLOWED_ATTR: ['href', 'title', 'alt', 'src', 'class'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ALLOW_DATA_ATTR: false
  });
};

/**
 * Sanitize plain text input to prevent script injection
 */
export const sanitizeText = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};

/**
 * Sanitize URL to prevent javascript: and data: URL attacks
 */
export const sanitizeUrl = (url: string): string => {
  const sanitized = DOMPurify.sanitize(url);

  // Additional URL validation
  try {
    const urlObj = new URL(sanitized, window.location.origin);

    // Block dangerous protocols
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return '#';
    }

    return urlObj.href;
  } catch {
    // Invalid URL, return safe default
    return '#';
  }
};

/**
 * Sanitize form data recursively
 */
export const sanitizeFormData = <T extends Record<string, any>>(data: T): T => {
  const sanitized = { ...data };

  for (const key in sanitized) {
    const value = sanitized[key];

    if (typeof value === 'string') {
      (sanitized as any)[key] = sanitizeText(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      (sanitized as any)[key] = sanitizeFormData(value);
    } else if (Array.isArray(value)) {
      (sanitized as any)[key] = value.map((item: any) =>
        typeof item === 'string' ? sanitizeText(item) :
        typeof item === 'object' && item !== null ? sanitizeFormData(item) :
        item
      );
    }
  }

  return sanitized;
};

// React component interfaces (implementation should be in a separate .tsx file)
export interface SafeHtmlProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
  component?: string;
}

export interface SafeTextProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
  allowFormatting?: boolean;
}

// Note: React components should be implemented in .tsx files
// Example usage:
// import { SafeHtml, SafeText } from './SafeComponents';
// These components will use sanitizeHtml and sanitizeText functions

/**
 * Configuration for different content types
 */
export const sanitizerConfigs = {
  // For user profiles and descriptions
  userContent: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p'],
    ALLOWED_ATTR: [],
  },

  // For comments and posts
  richContent: {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'u', 's', 'br', 'p', 'div',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a'
    ],
    ALLOWED_ATTR: ['href', 'title'],
    ALLOWED_URI_REGEXP: /^https?:\/\//i,
  },

  // For admin content (more permissive but still safe)
  adminContent: {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'u', 's', 'br', 'p', 'div', 'span',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'img', 'table', 'tr', 'td', 'th'
    ],
    ALLOWED_ATTR: ['href', 'title', 'alt', 'src', 'class', 'style'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  }
};

/**
 * Sanitize with custom config
 */
export const sanitizeWithConfig = (
  content: string,
  config: typeof sanitizerConfigs.userContent
): string => {
  return DOMPurify.sanitize(content, config);
};