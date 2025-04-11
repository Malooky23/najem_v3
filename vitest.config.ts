import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true, // Use Vitest's global APIs (describe, test, expect, etc.)
    environment: 'node', // Set the test environment to Node.js
    // Add any other specific test configurations here
    // e.g., setupFiles: ['./src/tests/setup.ts'], // If you need global setup
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Map '@/' to './src'
    },
  },
})