/**
 * Jest setup file
 * This file runs before all tests
 */

// Add missing web globals that cheerio/undici needs
(global as any).File = class File {
  constructor(chunks: any[], filename: string, options?: any) {
    // Mock File implementation
  }
};

(global as any).FormData = class FormData {
  constructor() {
    // Mock FormData implementation
  }
  append() {}
  delete() {}
  get() {}
  getAll() {}
  has() {}
  set() {}
  entries() { return [][Symbol.iterator](); }
  keys() { return [][Symbol.iterator](); }
  values() { return [][Symbol.iterator](); }
  forEach() {}
  [Symbol.iterator]() { return [][Symbol.iterator](); }
};

(global as any).Blob = class Blob {
  constructor(chunks?: any[], options?: any) {
    // Mock Blob implementation
  }
  size = 0;
  type = '';
  slice() { return new Blob(); }
  stream() {}
  text() { return Promise.resolve(''); }
  arrayBuffer() { return Promise.resolve(new ArrayBuffer(0)); }
  bytes() { return Promise.resolve(new Uint8Array(0)); }
};

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