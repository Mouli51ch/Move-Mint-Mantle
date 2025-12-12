import { 
  APIClientConfig, 
  APIError, 
  APIRequest, 
  APIResponse, 
  UserFriendlyError 
} from '@/lib/types/api';
import { handleError, networkMonitor } from '@/lib/utils/error-handler';

/**
 * Base HTTP client for Universal Minting Engine API integration
 * Handles authentication, retries, error handling, and CORS
 */
export class APIClient {
  private config: APIClientConfig;
  private retryQueue: Map<string, number> = new Map();

  constructor(config: Partial<APIClientConfig> = {}) {
    this.config = {
      baseURL: process.env.NEXT_PUBLIC_UNIVERSAL_MINTING_ENGINE_API_URL || 'https://api.universalmintingengine.com',
      timeout: 30000, // 30 seconds
      retryAttempts: 3,
      retryDelay: 1000, // 1 second base delay
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Client-Version': '1.0.0',
        'X-Client-Platform': 'web',
      },
      ...config,
    };

    // Add API key if available
    if (process.env.NEXT_PUBLIC_UNIVERSAL_MINTING_ENGINE_API_KEY) {
      this.config.headers['Authorization'] = `Bearer ${process.env.NEXT_PUBLIC_UNIVERSAL_MINTING_ENGINE_API_KEY}`;
    }
  }

  /**
   * Execute API request with retry logic and error handling
   */
  async request<T = any>(request: APIRequest): Promise<APIResponse<T>> {
    const requestId = this.generateRequestId();
    
    // Check network connectivity first
    if (!networkMonitor.getStatus()) {
      const processedError = handleError(new Error('No internet connection'), {
        operation: 'api_request',
        component: 'APIClient',
        additionalData: { endpoint: request.endpoint, requestId }
      });
      throw processedError;
    }
    
    try {
      return await this.executeWithRetry(request, requestId);
    } catch (error) {
      console.error(`API request failed [${requestId}]:`, error);
      
      // Use comprehensive error handling
      const processedError = handleError(error, {
        operation: 'api_request',
        component: 'APIClient',
        additionalData: { 
          endpoint: request.endpoint, 
          requestId,
          method: request.method || 'GET'
        }
      });
      
      throw processedError;
    }
  }

  /**
   * Execute request with exponential backoff retry logic
   */
  private async executeWithRetry<T>(
    request: APIRequest, 
    requestId: string,
    attempt: number = 1
  ): Promise<APIResponse<T>> {
    try {
      const response = await this.executeRequest(request, requestId);
      
      // Reset retry count on success
      this.retryQueue.delete(requestId);
      
      return response;
    } catch (error) {
      if (attempt >= this.config.retryAttempts || !this.shouldRetry(error)) {
        throw error;
      }

      // Calculate exponential backoff delay
      const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
      const jitter = Math.random() * 1000; // Add jitter to prevent thundering herd
      const totalDelay = Math.min(delay + jitter, 10000); // Cap at 10 seconds

      console.warn(`API request failed, retrying in ${totalDelay}ms (attempt ${attempt}/${this.config.retryAttempts})`);
      
      await this.delay(totalDelay);
      return this.executeWithRetry(request, requestId, attempt + 1);
    }
  }

  /**
   * Execute the actual HTTP request
   */
  private async executeRequest<T>(
    request: APIRequest, 
    requestId: string
  ): Promise<APIResponse<T>> {
    const url = `${this.config.baseURL}${request.endpoint}`;
    const timeout = request.timeout || this.config.timeout;

    // Create AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const fetchConfig: RequestInit = {
        method: request.method,
        headers: {
          ...this.config.headers,
          ...request.headers,
          'X-Request-ID': requestId,
        },
        signal: controller.signal,
        // Enable CORS
        mode: 'cors',
        credentials: 'omit', // Don't send cookies for security
      };

      // Add body for non-GET requests
      if (request.body && request.method !== 'GET') {
        if (request.body instanceof FormData) {
          // Remove Content-Type header for FormData (browser will set it with boundary)
          delete fetchConfig.headers!['Content-Type'];
          fetchConfig.body = request.body;
        } else {
          fetchConfig.body = JSON.stringify(request.body);
        }
      }

      const response = await fetch(url, fetchConfig);
      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await this.parseErrorResponse(response);
        throw new APIError(
          errorData.code || `HTTP_${response.status}`,
          errorData.message || response.statusText,
          errorData.details,
          this.isRetryableStatus(response.status),
          response.status
        );
      }

      // Parse successful response
      const data = await response.json();
      
      return {
        success: true,
        data,
        metadata: {
          timestamp: new Date().toISOString(),
          requestId,
          version: '1.0.0',
        },
      };

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new APIError(
          'TIMEOUT',
          `Request timed out after ${timeout}ms`,
          { timeout, endpoint: request.endpoint },
          true,
          408
        );
      }
      
      if (error instanceof APIError) {
        throw error;
      }
      
      // Network or other errors
      throw new APIError(
        'NETWORK_ERROR',
        error.message || 'Network request failed',
        { originalError: error },
        true,
        0
      );
    }
  }

  /**
   * Parse error response from API
   */
  private async parseErrorResponse(response: Response): Promise<any> {
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return { message: await response.text() };
    } catch {
      return { message: response.statusText };
    }
  }

  /**
   * Determine if an error should trigger a retry
   */
  private shouldRetry(error: any): boolean {
    if (error instanceof APIError) {
      return error.retryable;
    }
    
    // Retry on network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return true;
    }
    
    return false;
  }

  /**
   * Check if HTTP status code is retryable
   */
  private isRetryableStatus(status: number): boolean {
    // Retry on server errors and rate limiting
    return status >= 500 || status === 429 || status === 408;
  }

  /**
   * Handle and transform errors to user-friendly format
   */
  private handleError(error: any, endpoint: string): APIError {
    if (error instanceof APIError) {
      return error;
    }

    return new APIError(
      'UNKNOWN_ERROR',
      'An unexpected error occurred',
      { originalError: error, endpoint },
      false,
      500
    );
  }

  /**
   * Generate unique request ID for tracking
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Utility function for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<APIClientConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): APIClientConfig {
    return { ...this.config };
  }
}

/**
 * Custom APIError class for structured error handling
 */
export class APIError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any,
    public retryable: boolean = false,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Error handler utility for converting API errors to user-friendly messages
 */
export class APIErrorHandler {
  static handleError(error: APIError, context: string): UserFriendlyError {
    switch (error.code) {
      case 'RATE_LIMIT_EXCEEDED':
      case 'HTTP_429':
        return {
          message: 'Too many requests. Please wait a moment and try again.',
          action: 'retry',
          retryAfter: error.details?.retryAfter || 60,
          retryable: true,
        };
      
      case 'VALIDATION_ERROR':
      case 'HTTP_400':
        return {
          message: `Invalid ${error.details?.field || 'input'}: ${error.message}`,
          action: 'fix',
          field: error.details?.field,
          retryable: false,
        };
      
      case 'UNAUTHORIZED':
      case 'HTTP_401':
        return {
          message: 'Authentication failed. Please check your API credentials.',
          action: 'contact_support',
          retryable: false,
        };
      
      case 'FORBIDDEN':
      case 'HTTP_403':
        return {
          message: 'Access denied. You may not have permission for this action.',
          action: 'contact_support',
          retryable: false,
        };
      
      case 'NOT_FOUND':
      case 'HTTP_404':
        return {
          message: 'The requested resource was not found.',
          action: 'fix',
          retryable: false,
        };
      
      case 'IPFS_UPLOAD_ERROR':
        return {
          message: 'File upload failed. Please check your connection and try again.',
          action: 'retry',
          retryable: true,
        };
      
      case 'TIMEOUT':
        return {
          message: 'Request timed out. Please check your connection and try again.',
          action: 'retry',
          retryable: true,
        };
      
      case 'NETWORK_ERROR':
        return {
          message: 'Network error. Please check your internet connection.',
          action: 'retry',
          retryable: true,
        };
      
      case 'SERVER_ERROR':
      case 'HTTP_500':
      case 'HTTP_502':
      case 'HTTP_503':
      case 'HTTP_504':
        return {
          message: 'Server error. Please try again in a few moments.',
          action: 'retry',
          retryable: true,
        };
      
      default:
        return {
          message: 'An unexpected error occurred. Please try again.',
          action: 'retry',
          retryable: error.retryable,
        };
    }
  }

  /**
   * Get user-friendly error message for display
   */
  static getDisplayMessage(error: APIError, context?: string): string {
    const userError = this.handleError(error, context || 'general');
    return userError.message;
  }

  /**
   * Check if error is retryable
   */
  static isRetryable(error: APIError): boolean {
    const userError = this.handleError(error, 'general');
    return userError.retryable || false;
  }
}

// Create default client instance
export const apiClient = new APIClient();