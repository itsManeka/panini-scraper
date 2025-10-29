import type { Config } from 'jest';

const config: Config = {
    // Test environment
    preset: 'ts-jest',
    testEnvironment: 'node',

    // Test file patterns
    testMatch: [
        '**/tests/**/*.test.ts',
        '**/tests/**/*.spec.ts'
    ],

    // Coverage configuration
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/index.ts'
    ],

    coverageReporters: [
        'text',
        'lcov',
        'html',
        'json'
    ],

    coverageDirectory: 'coverage',

    // Coverage thresholds
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    },

    // Module path mapping (matching tsconfig.json)
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@/domain/(.*)$': '<rootDir>/src/domain/$1',
        '^@/usecases/(.*)$': '<rootDir>/src/usecases/$1',
        '^@/infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
        '^@/interfaces/(.*)$': '<rootDir>/src/interfaces/$1'
    },

    // Setup files
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

    // Test timeout
    testTimeout: 30000,

    // Verbose output
    verbose: true,

    // Transform configuration
    transform: {
        '^.+\\.ts$': 'ts-jest'
    },

    // Module file extensions
    moduleFileExtensions: ['ts', 'js', 'json'],

    // Clear mocks between tests
    clearMocks: true,

    // Restore mocks after each test
    restoreMocks: true
};

export default config;