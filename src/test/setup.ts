import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, afterAll, vi } from "vitest";
import { setupServer } from "msw/node";

// Setup MSW server for API mocking
export const server = setupServer();

// Global setup
beforeAll(() => {
  // Start the MSW server before all tests
  server.listen({ onUnhandledRequest: "warn" });
});

// Clean up after each test
afterEach(() => {
  cleanup(); // Clean up any mounted React components
  server.resetHandlers(); // Reset any request handlers that we may add during the tests
  vi.clearAllMocks(); // Clear all mocks between tests
});

// Clean up after all tests
afterAll(() => {
  server.close();
});
