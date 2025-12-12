/**
 * Comprehensive error handling system for MoveMint MVP
 * Provides user-friendly error messages and recovery strategies
 */

export interface ErrorContext {
  operation: string;
  component?: string;
  userId?: string;
  sessionId?: string;
  timestamp: number;
  userAgent?: string;
  url?: string;
  additionalData?: Record<string, any>;
}

export interface ErrorRecoveryAction {
  label: string;
  action: () => void | Promise<void>;
  primary?: boolean;
}

export interface ProcessedError {
  type: 'network' | 'validation' | 'authentication' | 'rate_limit' | 'server' | 'client' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userMessage: string;
  technicalMessage: string;
  recoveryActions: ErrorRecoveryAction[];
  shouldRetry: boolean;
  retryDelay?: number;
  context: ErrorContext;
}

/**
 * Main error handler class
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorReportingEnabled: boolean = false;

  private constructor() {
    this.errorReportingEnabled = process.env.NEXT_PUBLIC_ENABLE_ERROR_REPORTING === 'true';
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Process and categorize errors
   */
  processError(error: Error | any, context: Partial<ErrorContext>): ProcessedError {
    const fullContext: ErrorContext = {
      operation: 'unknown',
      timestamp: Date.now(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      ...context,
    };

    // Determine error type and create appropriate response
    if (this.isNetworkError(error)) {
      return this.handleNetworkError(error, fullContext);
    } else if (this.isValidationError(error)) {
      return this.handleValidationError(error, fullContext);
    } else if (this.isAuthenticationError(error)) {
      return this.handleAuthenticationError(error, fullContext);
    } else if (this.isRateLimitError(error)) {
      return this.handleRateLimitError(error, fullContext);
    } else if (this.isServerError(error)) {
      return this.handleServerError(error, fullContext);
    } else {
      return this.handleUnknownError(error, fullContext);
    }
  }

  /**
   * Handle network-related errors
   */
  private handleNetworkError(error: any, context: ErrorContext): ProcessedError {
    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
    
    return {
      type: 'network',
      severity: 'high',
      userMessage: isOffline 
        ? 'You appear to be offline. Please check your internet connection and try again.'
        : 'Network connection failed. Please check your internet connection and try again.',
      technicalMessage: error.message || 'Network request failed',
      shouldRetry: true,
      retryDelay: 2000,
      recoveryActions: [
        {
          label: 'Try Again',
          action: () => window.location.reload(),
          primary: true,
        },
        {
          label: 'Check Connection',
          action: () => {
            if (typeof window !== 'undefined') {
              window.open('https://www.google.com', '_blank');
            }
          },
        },
      ],
      context,
    };
  }

  /**
   * Handle validation errors
   */
  private handleValidationError(error: any, context: ErrorContext): ProcessedError {
    const validationMessage = this.extractValidationMessage(error);
    
    return {
      type: 'validation',
      severity: 'medium',
      userMessage: validationMessage || 'Please check your input and try again.',
      technicalMessage: error.message || 'Validation failed',
      shouldRetry: false,
      recoveryActions: [
        {
          label: 'Review Input',
          action: () => {
            // Focus on first invalid field if available
            const firstInvalidField = document.querySelector('[aria-invalid="true"]') as HTMLElement;
            if (firstInvalidField) {
              firstInvalidField.focus();
            }
          },
          primary: true,
        },
      ],
      context,
    };
  }

  /**
   * Handle authentication errors
   */
  private handleAuthenticationError(error: any, context: ErrorContext): ProcessedError {
    return {
      type: 'authentication',
      severity: 'high',
      userMessage: 'Authentication failed. Please connect your wallet and try again.',
      technicalMessage: error.message || 'Authentication error',
      shouldRetry: false,
      recoveryActions: [
        {
          label: 'Connect Wallet',
          action: () => {
            // Trigger wallet connection
            const connectButton = document.querySelector('[data-wallet-connect]') as HTMLElement;
            if (connectButton) {
              connectButton.click();
            }
          },
          primary: true,
        },
        {
          label: 'Refresh Page',
          action: () => window.location.reload(),
        },
      ],
      context,
    };
  }

  /**
   * Handle rate limiting errors
   */
  private handleRateLimitError(error: any, context: ErrorContext): ProcessedError {
    const retryAfter = this.extractRetryAfter(error) || 60000; // Default 1 minute
    
    return {
      type: 'rate_limit',
      severity: 'medium',
      userMessage: `Too many requests. Please wait ${Math.ceil(retryAfter / 1000)} seconds before trying again.`,
      technicalMessage: error.message || 'Rate limit exceeded',
      shouldRetry: true,
      retryDelay: retryAfter,
      recoveryActions: [
        {
          label: `Wait ${Math.ceil(retryAfter / 1000)}s`,
          action: () => {
            setTimeout(() => {
              window.location.reload();
            }, retryAfter);
          },
          primary: true,
        },
      ],
      context,
    };
  }

  /**
   * Handle server errors
   */
  private handleServerError(error: any, context: ErrorContext): ProcessedError {
    const status = error.status || error.response?.status;
    
    let userMessage = 'Server error occurred. Please try again later.';
    if (status === 503) {
      userMessage = 'Service is temporarily unavailable. Please try again in a few minutes.';
    } else if (status === 500) {
      userMessage = 'Internal server error. Our team has been notified.';
    }

    return {
      type: 'server',
      severity: 'high',
      userMessage,
      technicalMessage: error.message || `Server error (${status})`,
      shouldRetry: true,
      retryDelay: 5000,
      recoveryActions: [
        {
          label: 'Try Again',
          action: () => window.location.reload(),
          primary: true,
        },
        {
          label: 'Go to Dashboard',
          action: () => {
            if (typeof window !== 'undefined') {
              window.location.href = '/app/dashboard';
            }
          },
        },
      ],
      context,
    };
  }

  /**
   * Handle unknown errors
   */
  private handleUnknownError(error: any, context: ErrorContext): ProcessedError {
    return {
      type: 'unknown',
      severity: 'medium',
      userMessage: 'An unexpected error occurred. Please try again.',
      technicalMessage: error.message || 'Unknown error',
      shouldRetry: true,
      retryDelay: 1000,
      recoveryActions: [
        {
          label: 'Try Again',
          action: () => window.location.reload(),
          primary: true,
        },
        {
          label: 'Go Back',
          action: () => {
            if (typeof window !== 'undefined') {
              window.history.back();
            }
          },
        },
      ],
      context,
    };
  }

  /**
   * Error type detection methods
   */
  private isNetworkError(error: any): boolean {
    return (
      error.name === 'NetworkError' ||
      error.code === 'NETWORK_ERROR' ||
      error.message?.includes('fetch') ||
      error.message?.includes('network') ||
      error.message?.includes('connection') ||
      !navigator.onLine
    );
  }

  private isValidationError(error: any): boolean {
    return (
      error.name === 'ValidationError' ||
      error.code === 'VALIDATION_ERROR' ||
      error.status === 400 ||
      error.message?.includes('validation') ||
      error.message?.includes('invalid')
    );
  }

  private isAuthenticationError(error: any): boolean {
    return (
      error.name === 'AuthenticationError' ||
      error.code === 'AUTH_ERROR' ||
      error.status === 401 ||
      error.status === 403 ||
      error.message?.includes('unauthorized') ||
      error.message?.includes('authentication')
    );
  }

  private isRateLimitError(error: any): boolean {
    return (
      error.status === 429 ||
      error.code === 'RATE_LIMIT_ERROR' ||
      error.message?.includes('rate limit') ||
      error.message?.includes('too many requests')
    );
  }

  private isServerError(error: any): boolean {
    const status = error.status || error.response?.status;
    return status >= 500 && status < 600;
  }

  /**
   * Extract validation message from error
   */
  private extractValidationMessage(error: any): string | null {
    if (error.details && Array.isArray(error.details)) {
      return error.details.map((detail: any) => detail.message).join(', ');
    }
    
    if (error.errors && Array.isArray(error.errors)) {
      return error.errors.map((err: any) => err.message || err).join(', ');
    }

    return null;
  }

  /**
   * Extract retry-after header from error
   */
  private extractRetryAfter(error: any): number | null {
    const retryAfter = error.headers?.['retry-after'] || error.response?.headers?.['retry-after'];
    if (retryAfter) {
      const seconds = parseInt(retryAfter, 10);
      return isNaN(seconds) ? null : seconds * 1000;
    }
    return null;
  }

  /**
   * Report error to monitoring service
   */
  private reportError(processedError: ProcessedError): void {
    if (!this.errorReportingEnabled) {
      return;
    }

    // In a real implementation, this would send to Sentry, LogRocket, etc.
    console.error('Error reported:', {
      type: processedError.type,
      severity: processedError.severity,
      message: processedError.technicalMessage,
      context: processedError.context,
    });
  }

  /**
   * Log error for debugging
   */
  logError(processedError: ProcessedError): void {
    const isDevelopment = process.env.NEXT_PUBLIC_APP_ENV === 'development';
    
    if (isDevelopment) {
      console.group(`🚨 ${processedError.type.toUpperCase()} ERROR`);
      console.error('User Message:', processedError.userMessage);
      console.error('Technical Message:', processedError.technicalMessage);
      console.error('Context:', processedError.context);
      console.error('Recovery Actions:', processedError.recoveryActions.map(a => a.label));
      console.groupEnd();
    }

    this.reportError(processedError);
  }
}

/**
 * Convenience function to handle errors
 */
export function handleError(error: Error | any, context: Partial<ErrorContext>): ProcessedError {
  const errorHandler = ErrorHandler.getInstance();
  const processedError = errorHandler.processError(error, context);
  errorHandler.logError(processedError);
  return processedError;
}

/**
 * React Error Boundary helper
 * Note: This is a factory function that should be used in React components
 */
export function createErrorBoundary(fallbackComponent: any) {
  // This function should be used in React components where React is available
  // The actual implementation will be in the error-boundary.tsx component
  return null;
}

/**
 * Network connectivity monitor
 */
export class NetworkMonitor {
  private static instance: NetworkMonitor;
  private listeners: ((isOnline: boolean) => void)[] = [];
  private isOnline: boolean = true;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));
    }
  }

  static getInstance(): NetworkMonitor {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor();
    }
    return NetworkMonitor.instance;
  }

  private handleOnline() {
    this.isOnline = true;
    this.notifyListeners(true);
  }

  private handleOffline() {
    this.isOnline = false;
    this.notifyListeners(false);
  }

  private notifyListeners(isOnline: boolean) {
    this.listeners.forEach(listener => listener(isOnline));
  }

  subscribe(listener: (isOnline: boolean) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  getStatus(): boolean {
    return this.isOnline;
  }
}

// Export singleton instances
export const errorHandler = ErrorHandler.getInstance();
export const networkMonitor = NetworkMonitor.getInstance();