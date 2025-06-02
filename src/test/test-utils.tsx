import { render, RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";
import { vi } from "vitest";

// Add any providers here
const AllProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
  render(ui, { wrapper: AllProviders, ...options });

// Create a mock function with proper typing
const createMockFn = <T extends (...args: any[]) => any>() => {
  return vi.fn() as jest.MockedFunction<T>;
};

// Re-export everything from testing-library
export * from "@testing-library/react";

// Override render method
export { customRender as render, createMockFn };
