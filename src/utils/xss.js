/**
 * XSS Prevention Utilities
 * Provides comprehensive XSS protection for user-generated content
 */

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text safe for HTML
 */
export const escapeHtml = (text) => {
  if (text === null || text === undefined) return '';
  if (typeof text !== 'string') return String(text);
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return text.replace(/[&<>"'/]/g, (char) => map[char]);
};

/**
 * Sanitize HTML content (removes script tags and dangerous attributes)
 * Use this for content that should allow some HTML but not scripts
 * @param {string} html - HTML content to sanitize
 * @returns {string} - Sanitized HTML
 */
export const sanitizeHtml = (html) => {
  if (!html || typeof html !== 'string') return '';
  
  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remove data: URLs in iframes and objects (can contain scripts)
  sanitized = sanitized.replace(/<iframe[^>]*src\s*=\s*["']data:[^"']*["'][^>]*>/gi, '');
  sanitized = sanitized.replace(/<object[^>]*data\s*=\s*["']data:[^"']*["'][^>]*>/gi, '');
  
  return sanitized;
};

/**
 * Sanitize URL to prevent javascript: and data: protocols
 * @param {string} url - URL to sanitize
 * @returns {string} - Sanitized URL or empty string
 */
export const sanitizeUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  
  const trimmed = url.trim().toLowerCase();
  
  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'about:'];
  for (const protocol of dangerousProtocols) {
    if (trimmed.startsWith(protocol)) {
      return '';
    }
  }
  
  // Allow http, https, mailto, tel
  if (trimmed.startsWith('http://') || 
      trimmed.startsWith('https://') || 
      trimmed.startsWith('mailto:') || 
      trimmed.startsWith('tel:')) {
    return url.trim();
  }
  
  // If no protocol, assume it's relative or needs https
  if (!trimmed.match(/^[a-z]+:/)) {
    return url.trim();
  }
  
  return '';
};

/**
 * Sanitize attribute value to prevent XSS in attributes
 * @param {string} value - Attribute value to sanitize
 * @returns {string} - Sanitized attribute value
 */
export const sanitizeAttribute = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value !== 'string') return String(value);
  
  // Escape quotes and other dangerous characters
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

/**
 * Validate and sanitize CSS to prevent XSS
 * @param {string} css - CSS content to sanitize
 * @returns {string} - Sanitized CSS
 */
export const sanitizeCss = (css) => {
  if (!css || typeof css !== 'string') return '';
  
  // Remove javascript: in CSS
  css = css.replace(/javascript:/gi, '');
  
  // Remove expression() in CSS (IE-specific, can execute JS)
  css = css.replace(/expression\s*\(/gi, '');
  
  // Remove -moz-binding (Firefox-specific)
  css = css.replace(/-moz-binding/gi, '');
  
  return css;
};

/**
 * Safe innerHTML setter (sanitizes before setting)
 * @param {HTMLElement} element - DOM element
 * @param {string} html - HTML content to set
 */
export const safeSetInnerHTML = (element, html) => {
  if (!element || !html) return;
  element.innerHTML = sanitizeHtml(html);
};

/**
 * Safe textContent setter (escapes HTML)
 * Use this for user-generated text content
 * @param {HTMLElement} element - DOM element
 * @param {string} text - Text content to set
 */
export const safeSetTextContent = (element, text) => {
  if (!element) return;
  element.textContent = text || '';
};

/**
 * Create safe HTML string from user input
 * @param {string} text - User input text
 * @param {object} options - Options
 * @param {boolean} options.allowLinks - Allow anchor tags (default: false)
 * @param {boolean} options.allowFormatting - Allow basic formatting tags (default: false)
 * @returns {string} - Safe HTML string
 */
export const createSafeHtml = (text, options = {}) => {
  const { allowLinks = false, allowFormatting = false } = options;
  
  if (!text || typeof text !== 'string') return '';
  
  // If no formatting allowed, just escape everything
  if (!allowLinks && !allowFormatting) {
    return escapeHtml(text);
  }
  
  // Otherwise sanitize HTML
  let html = sanitizeHtml(text);
  
  // If links not allowed, remove all anchor tags
  if (!allowLinks) {
    html = html.replace(/<a\b[^<]*(?:(?!<\/a>)<[^<]*)*<\/a>/gi, '');
  } else {
    // Sanitize link hrefs
    html = html.replace(/<a\b([^>]*)\s*href\s*=\s*["']([^"']*)["']([^>]*)>/gi, (match, before, href, after) => {
      const sanitizedHref = sanitizeUrl(href);
      if (!sanitizedHref) {
        return ''; // Remove link if href is dangerous
      }
      return `<a${before} href="${sanitizedHref}"${after}>`;
    });
  }
  
  // If formatting not allowed, remove formatting tags
  if (!allowFormatting) {
    html = html.replace(/<\/?(?:b|strong|i|em|u|s|strike|br|p|div|span|h[1-6])[^>]*>/gi, '');
  }
  
  return html;
};

/**
 * React component prop sanitizer
 * Sanitizes props that will be rendered as HTML attributes
 * @param {object} props - Component props
 * @returns {object} - Sanitized props
 */
export const sanitizeProps = (props) => {
  if (!props || typeof props !== 'object') return {};
  
  const sanitized = {};
  for (const [key, value] of Object.entries(props)) {
    if (typeof value === 'string') {
      // Sanitize dangerous props
      if (key.toLowerCase().startsWith('on')) {
        // Remove event handlers
        continue;
      }
      if (key.toLowerCase() === 'href' || key.toLowerCase() === 'src') {
        sanitized[key] = sanitizeUrl(value);
      } else if (key.toLowerCase() === 'style') {
        sanitized[key] = sanitizeCss(value);
      } else {
        sanitized[key] = escapeHtml(value);
      }
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Check if string contains potential XSS attacks
 * @param {string} text - Text to check
 * @returns {boolean} - True if potentially dangerous
 */
export const containsXssPattern = (text) => {
  if (!text || typeof text !== 'string') return false;
  
  const xssPatterns = [
    /<script\b/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe\b/i,
    /<object\b/i,
    /<embed\b/i,
    /expression\s*\(/i,
    /-moz-binding/i,
    /vbscript:/i,
    /data:\s*text\/html/i,
  ];
  
  return xssPatterns.some(pattern => pattern.test(text));
};
