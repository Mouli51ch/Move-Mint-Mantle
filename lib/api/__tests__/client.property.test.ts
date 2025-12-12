/**
 * @jest-environment jsdom
 */

import * as fc from 'fast-check';
import { APIClient, APIError } from '../client';

// Mock fetch globally
global.fetch = jest.fn();

/**
 * **Feature: universal-minting-engine-integration, Property 10: API response validation**
 * **Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5**
 * 
 * Property-based tests for API client foundation
 * Tests that API client handles various inputs and responses correctly
 */
describe('APIClient Property-Based Tests', () => {
  let client: APIClient;
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    client = new APIClient({
      baseURL: 'https://test-api.example.com',
      timeout: 5000,
      retryAttempts: 1, // Reduce retries for faster tests
    });
    mockFetch.mockClear();
  });

  describe('Property 10: API response validation', () => {
    /**
     * Property: For any valid API request, the client should handle successful responses appropriately
     * This tests that the API client correctly processes various response formats
     */
    it('should validate and handle successful API responses correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate simple, valid endpoints
          fc.string({ minLength: 1, maxLength: 20 }).map(s => `/${s.replace(/[^a-zA-Z0-9]/g, 'x')}`),
          fc.constantFrom('GET', 'POST'),
          // Generate simple response data
          fc.record({
            message: fc.string({ minLength: 1, maxLength: 50 }),
            success: fc.constant(true),
            id: fc.integer({ min: 1, max: 1000 }),
          }),
          async (endpoint: string, method: 'GET' | 'POST', responseData: any) => {
            // Mock successful response
            mockFetch.mockResolvedValueOnce({
              ok: true,
              status: 200,
              json: async () => responseData,
              headers: new Headers({ 'content-type': 'application/json' }),
            } as Response);

            // Execute request
            const result = await client.request({
              endpoint,
              method,
            });

            // Validate response structure
            expect(result).toHaveProperty('success', true);
            expect(result).toHaveProperty('data', responseData);
            expect(result).toHaveProperty('metadata');
            expect(result.metadata).toHaveProperty('timestamp');
            expect(result.metadata).toHaveProperty('requestId');
            expect(result.metadata).toHaveProperty('version');

            // Validate that fetch was called correctly
            expect(mockFetch).toHaveBeenCalledWith(
              `https://test-api.example.com${endpoint}`,
              expect.objectContaining({
                method,
                headers: expect.any(Object),
              })
            );
          }
        ),
        { numRuns: 20 } // Reduced iterations for faster execution
      );
    });

    /**
     * Property: For any HTTP error response, the client should throw an appropriate APIError
     * This tests error handling across various error conditions
     */
    it('should handle HTTP errors consistently', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate simple endpoints
          fc.string({ minLength: 1, maxLength: 20 }).map(s => `/${s.replace(/[^a-zA-Z0-9]/g, 'x')}`),
          // Generate error status codes
          fc.constantFrom(400, 401, 403, 404, 500, 502, 503),
          fc.string({ minLength: 1, maxLength: 50 }),
          async (endpoint: string, statusCode: number, errorMessage: string) => {
            // Mock error response
            mockFetch.mockResolvedValueOnce({
              ok: false,
              status: statusCode,
              statusText: 'Error',
              json: async () => ({
                code: 'TEST_ERROR',
                message: errorMessage,
              }),
              headers: new Headers({ 'content-type': 'application/json' }),
            } as Response);

            // Execute request and expect error
            await expect(client.request({
              endpoint,
              method: 'GET',
            })).rejects.toThrow(APIError);
          }
        ),
        { numRuns: 15 } // Reduced iterations
      );
    });

    /**
     * Property: JSON serialization should be consistent
     * This tests that request bodies are properly serialized
     */
    it('should serialize request bodies consistently', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate simple JSON objects
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 20 }),
            value: fc.integer({ min: 1, max: 100 }),
            active: fc.boolean(),
          }),
          async (requestBody: any) => {
            // Mock successful response
            mockFetch.mockResolvedValueOnce({
              ok: true,
              status: 200,
              json: async () => ({ success: true }),
              headers: new Headers(),
            } as Response);

            // Execute POST request with body
            await client.request({
              endpoint: '/test',
              method: 'POST',
              body: requestBody,
            });

            // Verify that the body was serialized correctly
            const fetchCall = mockFetch.mock.calls[0];
            const [, config] = fetchCall;

            expect(config.body).toBe(JSON.stringify(requestBody));
            expect(config.headers['Content-Type']).toBe('application/json');
          }
        ),
        { numRuns: 10 } // Reduced iterations
      );
    });

    /**
     * Property: Configuration updates should be applied correctly
     * This tests that client configuration can be updated and persists
     */
    it('should apply configuration updates correctly', async () => {
      await fc.assert(
        fc.property(
          // Generate simple configuration updates
          fc.record({
            timeout: fc.option(fc.integer({ min: 1000, max: 10000 })),
            retryAttempts: fc.option(fc.integer({ min: 0, max: 3 })),
          }),
          (configUpdate: any) => {
            // Apply configuration update
            client.updateConfig(configUpdate);
            
            // Get current configuration
            const currentConfig = client.getConfig();
            
            // Verify that updates were applied
            if (configUpdate.timeout !== undefined) {
              expect(currentConfig.timeout).toBe(configUpdate.timeout);
            }
            if (configUpdate.retryAttempts !== undefined) {
              expect(currentConfig.retryAttempts).toBe(configUpdate.retryAttempts);
            }
          }
        ),
        { numRuns: 10 } // Reduced iterations
      );
    });

    /**
     * Property: Request IDs should be unique
     * This tests that request ID generation produces unique identifiers
     */
    it('should generate unique request IDs', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate a small number of concurrent requests
          fc.array(
            fc.record({
              endpoint: fc.constantFrom('/test1', '/test2', '/test3'),
              method: fc.constantFrom('GET', 'POST'),
            }),
            { minLength: 2, maxLength: 5 }
          ),
          async (requests: any[]) => {
            // Mock successful responses for all requests
            requests.forEach(() => {
              mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ success: true }),
                headers: new Headers(),
              } as Response);
            });

            // Execute all requests concurrently
            const promises = requests.map(req => client.request(req));
            const results = await Promise.all(promises);

            // Extract request IDs from results
            const requestIds = results.map(result => result.metadata?.requestId);

            // Verify all request IDs are unique
            const uniqueIds = new Set(requestIds);
            expect(uniqueIds.size).toBe(requestIds.length);

            // Verify all request IDs follow the expected format
            requestIds.forEach(id => {
              expect(id).toMatch(/^req_\d+_[a-z0-9]+$/);
            });
          }
        ),
        { numRuns: 10 } // Reduced iterations
      );
    });
  });
});