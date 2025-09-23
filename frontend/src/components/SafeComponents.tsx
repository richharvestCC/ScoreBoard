import React from 'react';
import { sanitizeHtml, sanitizeText, SafeHtmlProps, SafeTextProps } from '../utils/sanitizer';

/**
 * React component for safe HTML rendering
 */
export const SafeHtml: React.FC<SafeHtmlProps> = ({
  content,
  className,
  style,
  component = 'div'
}) => {
  const Component = component as React.ElementType;

  return (
    <Component
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
    />
  );
};

/**
 * React component for safe text rendering with basic formatting
 */
export const SafeText: React.FC<SafeTextProps> = ({
  content,
  className,
  style,
  allowFormatting = false
}) => {
  const sanitized = allowFormatting ? sanitizeHtml(content) : sanitizeText(content);

  return allowFormatting ? (
    <span
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  ) : (
    <span className={className} style={style}>
      {sanitized}
    </span>
  );
};