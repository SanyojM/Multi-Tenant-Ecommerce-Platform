import { customMatchers, setupTestEnvironment } from './test-setup';

// Setup test environment variables
setupTestEnvironment();

// Extend Jest with custom matchers
expect.extend(customMatchers);

// Global test timeout
jest.setTimeout(30000);

// Mock console methods during tests to reduce noise
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

beforeAll(() => {
  // Only show console output if TEST_VERBOSE is set
  if (!process.env.TEST_VERBOSE) {
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  }
});

afterAll(() => {
  // Restore console methods
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Mock Supabase service for tests that don't need actual file uploads
jest.mock('../src/supabase/supabase.service', () => {
  return {
    SupabaseService: jest.fn().mockImplementation(() => ({
      uploadCategoryImage: jest.fn().mockResolvedValue('https://mock-supabase.com/mock-image-url.jpg'),
      deleteCategoryImage: jest.fn().mockResolvedValue(undefined),
      uploadStoreImage: jest.fn().mockResolvedValue('https://mock-supabase.com/mock-store-image-url.jpg'),
    })),
  };
});

// Mock DNS module for domain verification tests
jest.mock('dns/promises', () => ({
  resolve: jest.fn().mockRejectedValue(new Error('DNS lookup failed')),
}));

// Mock file system operations for domain verification
jest.mock('fs/promises', () => ({
  writeFile: jest.fn().mockResolvedValue(undefined),
  symlink: jest.fn().mockResolvedValue(undefined),
}));

// Mock child_process for nginx operations
jest.mock('child_process', () => ({
  exec: jest.fn((command, callback) => {
    // Mock successful command execution
    callback(null, 'Command executed successfully', '');
  }),
}));
