/**
 * Performance Monitoring Utilities
 * Track page load times, API response times, and performance metrics
 */

import { logWarn, logInfo } from './logger';
import { SLOW_API_THRESHOLD, SLOW_RESOURCE_THRESHOLD } from './constants';

/**
 * Measure page load performance
 * @returns {object} - Performance metrics
 */
export const measurePageLoad = () => {
  if (typeof window === 'undefined' || !window.performance) {
    return null;
  }

  const perfData = window.performance.timing;
  const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
  const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.navigationStart;
  const firstByte = perfData.responseStart - perfData.navigationStart;

  return {
    pageLoadTime,
    domContentLoaded,
    firstByte,
    dns: perfData.domainLookupEnd - perfData.domainLookupStart,
    tcp: perfData.connectEnd - perfData.connectStart,
    request: perfData.responseStart - perfData.requestStart,
    response: perfData.responseEnd - perfData.responseStart,
    domProcessing: perfData.domComplete - perfData.domLoading,
    domInteractive: perfData.domInteractive - perfData.domLoading,
  };
};

/**
 * Measure API response time
 * @param {Function} apiCall - Async function that makes API call
 * @returns {Promise<object>} - { result, responseTime }
 */
export const measureApiResponse = async (apiCall) => {
  const startTime = performance.now();
  try {
    const result = await apiCall();
    const endTime = performance.now();
    const responseTime = endTime - startTime;

    // Log slow API calls
    if (responseTime > SLOW_API_THRESHOLD) {
      logWarn(`[Performance] Slow API call: ${responseTime.toFixed(2)}ms`);
    }

    return {
      result,
      responseTime,
      success: true,
    };
  } catch (error) {
    const endTime = performance.now();
    const responseTime = endTime - startTime;

    return {
      error,
      responseTime,
      success: false,
    };
  }
};

/**
 * Monitor Core Web Vitals
 * Tracks LCP, FID, CLS
 */
export const monitorWebVitals = () => {
  if (typeof window === 'undefined') return;

  // Largest Contentful Paint (LCP)
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        logInfo('[Performance] LCP', { value: lastEntry.renderTime || lastEntry.loadTime });
        
        // Send to analytics if available
        if (window.gtag) {
          window.gtag('event', 'web_vitals', {
            metric_name: 'LCP',
            metric_value: Math.round(lastEntry.renderTime || lastEntry.loadTime),
            metric_id: lastEntry.id,
          });
        }
      });
      
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // PerformanceObserver not supported
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const fid = entry.processingStart - entry.startTime;
          
          logInfo('[Performance] FID', { value: fid });
          
          if (window.gtag) {
            window.gtag('event', 'web_vitals', {
              metric_name: 'FID',
              metric_value: Math.round(fid),
              metric_id: entry.id,
            });
          }
        });
      });
      
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      // PerformanceObserver not supported
    }

    // Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        
        logInfo('[Performance] CLS', { value: clsValue });
        
        if (window.gtag) {
          window.gtag('event', 'web_vitals', {
            metric_name: 'CLS',
            metric_value: Math.round(clsValue * 1000) / 1000,
          });
        }
      });
      
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      // PerformanceObserver not supported
    }
  }
};

/**
 * Track resource load times
 */
export const trackResourceLoadTimes = () => {
  if (typeof window === 'undefined' || !window.performance) return;

  window.addEventListener('load', () => {
    const resources = performance.getEntriesByType('resource');
    const resourceMetrics = {
      images: [],
      scripts: [],
      stylesheets: [],
      fonts: [],
      other: [],
    };

    resources.forEach((resource) => {
      const loadTime = resource.responseEnd - resource.startTime;
      const resourceType = resource.initiatorType || 'other';

      const metric = {
        name: resource.name.split('/').pop(),
        loadTime: Math.round(loadTime),
        size: resource.transferSize || 0,
      };

      if (resourceType === 'img') {
        resourceMetrics.images.push(metric);
      } else if (resourceType === 'script') {
        resourceMetrics.scripts.push(metric);
      } else if (resourceType === 'link' && resource.name.includes('.css')) {
        resourceMetrics.stylesheets.push(metric);
      } else if (resourceType === 'css' || resource.name.includes('.woff')) {
        resourceMetrics.fonts.push(metric);
      } else {
        resourceMetrics.other.push(metric);
      }
    });

    logInfo('[Performance] Resource Load Times', resourceMetrics);

    // Log slow resources
    resources.forEach((resource) => {
      const loadTime = resource.responseEnd - resource.startTime;
      if (loadTime > SLOW_RESOURCE_THRESHOLD) {
        logWarn(`[Performance] Slow resource: ${resource.name}`, { loadTime: Math.round(loadTime) });
      }
    });
  });
};

/**
 * Initialize performance monitoring
 * Call this once on app initialization
 */
export const initPerformanceMonitoring = () => {
  // Monitor Core Web Vitals
  monitorWebVitals();

  // Track resource load times
  trackResourceLoadTimes();

  // Measure initial page load
  if (document.readyState === 'complete') {
    const metrics = measurePageLoad();
    if (metrics) {
      logInfo('[Performance] Page Load Metrics', metrics);
    }
  } else {
    window.addEventListener('load', () => {
      const metrics = measurePageLoad();
      if (metrics) {
        logInfo('[Performance] Page Load Metrics', metrics);
        
        // Track in analytics
        if (window.gtag) {
          window.gtag('event', 'page_load_time', {
            value: Math.round(metrics.pageLoadTime),
            metric_name: 'Page Load Time',
          });
        }
      }
    });
  }
};
