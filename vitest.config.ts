import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      all: true,
      thresholds: {
        global: {
          lines: 90,
          branches: 90,
          functions: 90,
          statements: 90,
        },
      },
    },
    reporters: ['verbose'],
  },
});
