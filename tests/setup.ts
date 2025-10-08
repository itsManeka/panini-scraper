/**
 * Jest setup file
 * This file runs before all tests
 */

// Mock console methods to reduce noise in test output
const originalConsole = console;

beforeEach(() => {
  // Optionally mock console methods if needed
  // global.console = {
  //   ...originalConsole,
  //   log: jest.fn(),
  //   error: jest.fn(),
  //   warn: jest.fn(),
  //   info: jest.fn()
  // };
});

afterEach(() => {
  // Restore console after each test if mocked
  // global.console = originalConsole;
});