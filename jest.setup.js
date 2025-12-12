import '@testing-library/jest-dom'

// Mock environment variables for tests
process.env.NEXT_PUBLIC_UNIVERSAL_MINTING_ENGINE_API_URL = 'https://test-api.example.com'
process.env.NEXT_PUBLIC_APP_ENV = 'test'
process.env.NEXT_PUBLIC_ENABLE_DEBUG_LOGS = 'false'

// Mock fetch globally for all tests
global.fetch = jest.fn()

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore specific console methods in tests
  // log: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
}