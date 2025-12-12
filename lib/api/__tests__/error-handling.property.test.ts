/**
 * @jest-environment jsdom
 */

import * as fc from 'fast-check';
import { APIClient, APIError, APIErrorHandler } from '../client';
import { universalMintingEngineService } from '../service';

// Mock fetch globally
global.fetch = jest.fn();

/**
 * **Feature: universal-minting-engine-integration, Property 2: API error handling**
 * **Validates: Requirements 1.4, 1.5, 7.1, 7.2, 7.3**
 * 
 * Property-based tests for API error handling
 * Tests that error handling works consistently across various failure scenarios
 */
describe('API Error Handling Property-Based Tests', () => {
  let client: APIClient;
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    client = new APIClient({
      baseURL: 'https://test-api.example.com',
      timeout: 5000,
      retryAttempts: 1, // Reduce for faster tests
    });
    mockFetch.mockClear();
  });

  describe('Property 2: API error handling', () => {
    /**
     * Property: For any API error response, the client should handle it appropriately
     * This tests that error handling is consistent across various error conditions
     */
    it('should handle API errors consistently across different error types', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate various error scenarios
          fc.record({
            statusCode: fc.constantFrom(400, 401, 403, 404, 429, 500, 502, 503, 504),
            errorCode: fc.constantFrom(
              'VALIDATION_ERROR',
              'UNAUTHORIZED',
              'FORBIDDEN',
              'NOT_FOUND',
              'RATE_LIMIT_EXCEEDED',
              'SERVER_ERROR',
              'NETWORK_ERROR'
            ),
            message: fc.string({ minLength: 1, maxLength: 100 }),
            retryable: fc.boolean(),
          }),
          fc.string({ minLength: 1, maxLength: 20 }).map(s => `/${s}`), // endpoint
          async (errorScenario: any, endpoint: string) => {
            // Mock error response
            mockFetch.mockResolvedValueOnce({
              ok: false,
              status: errorScenario.statusCode,
              statusText: 'Error',
              json: async () => ({
                code: errorScenario.errorCode,
                message: errorScenario.message,
                retryable: errorScenario.retryable,
              }),
              headers: new Headers({ 'content-type': 'application/json' }),
            } as Response);

            // Execute request and expect error
            try {
              await client.request({
                endpoint,
                method: 'GET',
              });
              // Should not reach here
              expect(true).toBe(false);
            } catch (error) {
              expect(error).toBeInstanceOf(APIError);
              
              const apiError = error as APIError;
              expect(apiError.statusCode).toBe(errorScenario.statusCode);
              expect(apiError.message).toBe(errorScenario.message);
              
              // Verify error handler produces consistent user-friendly messages
              const userError = APIErrorHandler.handleError(apiError, 'test');
              expect(userError.message).toBeTruthy();
              expect(typeof userError.message).toBe('string');
              expect(userError.action).toMatch(/^(retry|fix|contact_support)$/);
            }
          }
        ),
        { numRuns: 15 }
      );
    });

    /**
     * Property: Retry logic should be applied consistently based on error types
     * This tests that retryable errors trigger retries while non-retryable don't
     */
    it('should apply retry logic consistently based on error characteristics', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            statusCode: fc.integer({ min: 400, max: 599 }),
            shouldRetry: fc.boolean(),
          }),
          async (errorConfig: any) => {
            const expectedRetryable = errorConfig.statusCode >= 500 || 
                                    errorConfig.statusCode === 429 || 
                                    errorConfig.statusCode === 408;

            // Mock error response
            mockFetch.mockResolvedValue({
              ok: false,
              status: errorConfig.statusCode,
              statusText: 'Error',
              json: async () => ({
                code: 'TEST_ERROR',
                message: 'Test error message',
              }),
              headers: new Headers({ 'content-type': 'application/json' }),
            } as Response);

            try {
              await client.request({
                endpoint: '/test',
                method: 'GET',
              });
            } catch (error) {
              expect(error).toBeInstanceOf(APIError);
              
              const apiError = error as APIError;
              expect(apiError.retryable).toBe(expectedRetryable);
              
              // Verify retry attempts match expected behavior
              const expectedCalls = expectedRetryable ? 2 : 1; // 1 initial + 1 retry for retryable
              expect(mockFetch).toHaveBeenCalledTimes(expectedCalls);
            }
          }
        ),
        { numRuns: 10 }
      );
    });

    /**
     * Property: Network errors should be handled consistently
     * This tests that network-level errors are properly categorized and handled
     */
    it('should handle network errors consistently', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(
            'TypeError: Failed to fetch',
            'NetworkError: Network request failed',
            'AbortError: The operation was aborted'
          ),
          async (networkError: string) => {
            // Mock network error
            mockFetch.mockRejectedValue(new Error(networkError));

            try {
              await client.request({
                endpoint: '/test',
                method: 'GET',
              });
            } catch (error) {
              expect(error).toBeInstanceOf(APIError);
              
              const apiError = error as APIError;
              expect(apiError.code).toBe('NETWORK_ERROR');
              expect(apiError.retryable).toBe(true);
              
              // Verify user-friendly error handling
              const userError = APIErrorHandler.handleError(apiError, 'test');
              expect(userError.retryable).toBe(true);
              expect(userError.action).toBe('retry');
            }
          }
        ),
        { numRuns: 8 }
      );
    });

    /**
     * Property: Error messages should be user-friendly and consistent
     * This tests that error handler produces appropriate messages for users
     */
    it('should produce consistent user-friendly error messages', async () => {
      await fc.assert(
        fc.property(
          fc.record({
            code: fc.constantFrom(
              'RATE_LIMIT_EXCEEDED',
              'VALIDATION_ERROR',
              'UNAUTHORIZED',
              'NOT_FOUND',
              'SERVER_ERROR',
              'NETWORK_ERROR'
            ),
            message: fc.string({ minLength: 1, maxLength: 100 }),
            statusCode: fc.integer({ min: 400, max: 599 }),
            details: fc.option(fc.record({
              field: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
              retryAfter: fc.option(fc.integer({ min: 1, max: 300 })),
            })),
          }),
          (errorData: any) => {
            const apiError = new APIError(
              errorData.code,
              errorData.message,
              errorData.details,
              false,
              errorData.statusCode
            );

            const userError = APIErrorHandler.handleError(apiError, 'test');

            // Verify user error structure
            expect(userError.message).toBeTruthy();
            expect(typeof userError.message).toBe('string');
            expect(userError.message.length).toBeGreaterThan(0);
            expect(userError.action).toMatch(/^(retry|fix|contact_support)$/);
            expect(typeof userError.retryable).toBe('boolean');

            // Verify specific error type handling
            switch (errorData.code) {
              case 'RATE_LIMIT_EXCEEDED':
                expect(userError.action).toBe('retry');
                expect(userError.retryable).toBe(true);
                if (errorData.details?.retryAfter) {
                  expect(userError.retryAfter).toBe(errorData.details.retryAfter);
                }
                break;
              
              case 'VALIDATION_ERROR':
                expect(userError.action).toBe('fix');
                expect(userError.retryable).toBe(false);
                if (errorData.details?.field) {
                  expect(userError.field).toBe(errorData.details.field);
                }
                break;
              
              case 'UNAUTHORIZED':
              case 'FORBIDDEN':
                expect(userError.action).toBe('contact_support');
                expect(userError.retryable).toBe(false);
                break;
              
              case 'NETWORK_ERROR':
                expect(userError.action).toBe('retry');
                expect(userError.retryable).toBe(true);
                break;
            }
          }
        ),
        { numRuns: 15 }
      );
    });

    /**
     * Property: Service-level error handling should be consistent
     * This tests that the UniversalMintingEngineService handles errors appropriately
     */
    it('should handle service-level errors consistently', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            method: fc.constantFrom('uploadVideo', 'getVideoStatus', 'getLicenseTemplates'),
            errorType: fc.constantFrom('network', 'validation', 'server'),
            message: fc.string({ minLength: 1, maxLength: 100 }),
          }),
          async (testCase: any) => {
            // Mock the underlying API client to throw errors
            const originalRequest = client.request;
            client.request = jest.fn().mockRejectedValue(
              new APIError(
                testCase.errorType.toUpperCase() + '_ERROR',
                testCase.message,
                {},
                testCase.errorType === 'network' || testCase.errorType === 'server',
                testCase.errorType === 'validation' ? 400 : 500
              )
            );

            try {
              switch (testCase.method) {
                case 'uploadVideo':
                  const mockFile = new File(['test'], 'test.mp4', { type: 'video/mp4' });
                  await universalMintingEngineService.uploadVideo(mockFile, { title: 'Test' });
                  break;
                case 'getVideoStatus':
                  await universalMintingEngineService.getVideoStatus('test-id');
                  break;
                case 'getLicenseTemplates':
                  await universalMintingEngineService.getLicenseTemplates();
                  break;
              }
              
              // Should not reach here
              expect(true).toBe(false);
            } catch (error) {
              expect(error).toBeInstanceOf(APIError);
              
              const apiError = error as APIError;
              expect(apiError.message).toBeTruthy();
              
              // Verify error is properly categorized
              const isRetryable = testCase.errorType === 'network' || testCase.errorType === 'server';
              expect(apiError.retryable).toBe(isRetryable);
            }

            // Restore original method
            client.request = originalRequest;
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  describe('Error Recovery Properties', () => {
    /**
     * Property: Error recovery should work consistently across different scenarios
     * This tests that applications can recover from errors appropriately
     */
    it('should support consistent error recovery patterns', async () => {
      await fc.assert(
        fc.property(
          fc.array(
            fc.record({
              shouldSucceed: fc.boolean(),
              errorCode: fc.constantFrom('NETWORK_ERROR', 'SERVER_ERROR', 'VALIDATION_ERROR'),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (attempts: any[]) => {
            let successfulAttempt = -1;
            
            attempts.forEach((attempt, index) => {
              const apiError = new APIError(
                attempt.errorCode,
                'Test error',
                {},
                attempt.errorCode !== 'VALIDATION_ERROR',
                attempt.errorCode === 'VALIDATION_ERROR' ? 400 : 500
              );

              const userError = APIErrorHandler.handleError(apiError, 'test');
              
              if (attempt.shouldSucceed && successfulAttempt === -1) {
                successfulAttempt = index;
              }

              // Verify error characteristics are consistent
              expect(userError.retryable).toBe(attempt.errorCode !== 'VALIDATION_ERROR');
              
              if (userError.retryable && successfulAttempt === -1) {
                expect(userError.action).toBe('retry');
              } else if (!userError.retryable) {
                expect(userError.action).toMatch(/^(fix|contact_support)$/);
              }
            });
          }
        ),
        { numRuns: 8 }
      );
    });
  });
});