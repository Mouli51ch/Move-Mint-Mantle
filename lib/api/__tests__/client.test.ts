/**
 * @jest-environment jsdom
 */

import { APIClient, APIError, APIErrorHandler } from '../client';
import { APIClientConfig } from '../../types/api';

// Mock fetch globally
global.fetch = jest.fn();

describe('APIClient', () => {
  let client: APIClient;
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    client = new APIClient({
      baseURL: 'https://test-api.example.com',
      timeout: 5000,
      retryAttempts: 2,
    });
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('successful requests', () => {
    it('should make successful GET request', async () => {
      const mockResponse = { success: true, data: { message: 'test' } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      } as Response);

      const result = await client.request({
        endpoint: '/test',
        method: 'GET',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-api.example.com/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }),
        })
      );
    });

    it('should make successful POST request with JSON body', async () => {
      const mockResponse = { success: true, data: { id: 1 } };
      const requestBody = { name: 'test' };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      } as Response);

      const result = await client.request({
        endpoint: '/create',
        method: 'POST',
        body: requestBody,
      });

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-api.example.com/create',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should handle FormData body correctly', async () => {
      const mockResponse = { success: true };
      const formData = new FormData();
      formData.append('file', new Blob(['test']), 'test.txt');
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      } as Response);

      await client.request({
        endpoint: '/upload',
        method: 'POST',
        body: formData,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-api.example.com/upload',
        expect.objectContaining({
          method: 'POST',
          body: formData,
          headers: expect.not.objectContaining({
            'Content-Type': expect.any(String),
          }),
        })
      );
    });
  });

  describe('error handling', () => {
    it('should handle HTTP 400 error', async () => {
      const errorResponse = {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: { field: 'name' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => errorResponse,
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      await expect(client.request({
        endpoint: '/test',
        method: 'GET',
      })).rejects.toThrow(APIError);
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Network error'));

      await expect(client.request({
        endpoint: '/test',
        method: 'GET',
      })).rejects.toThrow(APIError);
    });

    it('should handle timeout errors', async () => {
      jest.useFakeTimers();
      
      // Mock a request that never resolves
      mockFetch.mockImplementationOnce(() => new Promise(() => {}));

      const requestPromise = client.request({
        endpoint: '/test',
        method: 'GET',
        timeout: 1000,
      });

      // Fast-forward time to trigger timeout
      jest.advanceTimersByTime(1000);

      await expect(requestPromise).rejects.toThrow('Request timed out');
      
      jest.useRealTimers();
    }, 10000); // Increase timeout for this test
  });

  describe('retry logic', () => {
    it('should retry on retryable errors', async () => {
      // First call fails with 500, second succeeds
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: async () => ({ message: 'Server error' }),
          headers: new Headers(),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
          headers: new Headers(),
        } as Response);

      const result = await client.request({
        endpoint: '/test',
        method: 'GET',
      });

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    }, 10000); // Increase timeout for this test

    it('should not retry on non-retryable errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ 
          code: 'VALIDATION_ERROR',
          message: 'Invalid request' 
        }),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      await expect(client.request({
        endpoint: '/test',
        method: 'GET',
      })).rejects.toThrow(APIError);

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('configuration', () => {
    it('should use custom configuration', () => {
      const customConfig: Partial<APIClientConfig> = {
        baseURL: 'https://custom-api.example.com',
        timeout: 10000,
        headers: { 'Custom-Header': 'value' },
      };

      const customClient = new APIClient(customConfig);
      const config = customClient.getConfig();

      expect(config.baseURL).toBe('https://custom-api.example.com');
      expect(config.timeout).toBe(10000);
      expect(config.headers['Custom-Header']).toBe('value');
    });

    it('should update configuration', () => {
      client.updateConfig({ timeout: 15000 });
      const config = client.getConfig();
      
      expect(config.timeout).toBe(15000);
    });
  });
});

describe('APIErrorHandler', () => {
  it('should handle rate limit errors', () => {
    const error = new APIError('RATE_LIMIT_EXCEEDED', 'Too many requests', { retryAfter: 60 }, true, 429);
    const userError = APIErrorHandler.handleError(error, 'test');

    expect(userError.message).toContain('Too many requests');
    expect(userError.action).toBe('retry');
    expect(userError.retryable).toBe(true);
    expect(userError.retryAfter).toBe(60);
  });

  it('should handle validation errors', () => {
    const error = new APIError('VALIDATION_ERROR', 'Invalid field', { field: 'email' }, false, 400);
    const userError = APIErrorHandler.handleError(error, 'test');

    expect(userError.message).toContain('Invalid email');
    expect(userError.action).toBe('fix');
    expect(userError.field).toBe('email');
    expect(userError.retryable).toBe(false);
  });

  it('should handle unknown errors', () => {
    const error = new APIError('UNKNOWN_ERROR', 'Something went wrong', {}, false, 500);
    const userError = APIErrorHandler.handleError(error, 'test');

    expect(userError.message).toContain('unexpected error');
    expect(userError.action).toBe('retry');
  });

  it('should check if error is retryable', () => {
    const retryableError = new APIError('NETWORK_ERROR', 'Network failed', {}, true, 0);
    const nonRetryableError = new APIError('VALIDATION_ERROR', 'Invalid input', {}, false, 400);

    expect(APIErrorHandler.isRetryable(retryableError)).toBe(true);
    expect(APIErrorHandler.isRetryable(nonRetryableError)).toBe(false);
  });
});