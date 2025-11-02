import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// Mock environment variables for tests
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_API_BASE_URL: 'http://localhost:5000',
    VITE_GOOGLE_CLIENT_ID: 'test-google-client-id',
    VITE_ENABLE_GOOGLE_AUTH: 'true',
    VITE_ENABLE_PAYMENTS: 'true',
    VITE_STRIPE_PUBLIC_KEY: 'test-stripe-key',
    MODE: 'test',
    DEV: false,
    PROD: false,
    SSR: false,
  },
  writable: true,
});
