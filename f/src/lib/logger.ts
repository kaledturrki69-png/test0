/**
 * Application Logger
 *
 * Centralized logging system that:
 * - Removes console.log in production
 * - Can be extended to send errors to monitoring services (Sentry, etc.)
 * - Provides consistent logging interface
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogData {
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Log informational messages
   * Only outputs in development
   */
  info(message: string, data?: LogData): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.log(`ℹ️ [INFO] ${message}`, data || '');
    }
  }

  /**
   * Log warning messages
   * Outputs in all environments
   */
  warn(message: string, data?: LogData): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.warn(`⚠️ [WARN] ${message}`, data || '');
    } else {
      // In production, you might want to send to monitoring service
      // eslint-disable-next-line no-console
      console.warn(`⚠️ ${message}`);
    }
  }

  /**
   * Log error messages
   * Always outputs, should integrate with error tracking service
   */
  error(message: string, error?: Error | unknown, data?: LogData): void {
    // eslint-disable-next-line no-console
    console.error(`❌ [ERROR] ${message}`, { error, ...data });

    // TODO: Send to error tracking service (Sentry, etc.)
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error, {
    //     extra: { message, ...data }
    //   });
    // }
  }

  /**
   * Log debug messages
   * Only outputs in development
   */
  debug(message: string, data?: LogData): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.debug(`🐛 [DEBUG] ${message}`, data || '');
    }
  }

  /**
   * Log with custom level
   */
  log(level: LogLevel, message: string, data?: LogData): void {
    switch (level) {
      case 'info':
        this.info(message, data);
        break;
      case 'warn':
        this.warn(message, data);
        break;
      case 'error':
        this.error(message, undefined, data);
        break;
      case 'debug':
        this.debug(message, data);
        break;
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Usage examples:
// logger.info('User logged in', { userId: 123 });
// logger.warn('API rate limit approaching', { remaining: 10 });
// logger.error('Failed to fetch data', error, { endpoint: '/api/users' });
// logger.debug('Component mounted', { componentName: 'Header' });
