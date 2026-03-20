const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Path ke Next.js app untuk memuat next.config.ts dan .env
  dir: './',
});

/** @type {import('jest').Config} */
const config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  // Setup file yang dijalankan setelah jest environment siap
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // Module name mapper untuk path alias @/*
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@db$': '<rootDir>/prisma/index.ts',
    '^@sql$': '<rootDir>/node_modules/.prisma/client/sql/',
  },
  // Pattern file test yang akan dideteksi, exclude e2e
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/e2e/',
    '/src/components/ui/',
    '/src/contexts/',
  ],
  // Collect coverage dari direktori src
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/_*.{js,jsx,ts,tsx}',
    '!src/**/index.{js,jsx,ts,tsx}',
    '!src/components/ui/**',
    '!src/contexts/**',
  ],
  // Transform ES Modules packages
  transformIgnorePatterns: [
    '/node_modules/(?!(@stepperize/react|@stepperize/core)/)',
  ],
};

// createJestConfig diekspor agar next/jest bisa load konfigurasi Next.js yang async
module.exports = createJestConfig(config);
