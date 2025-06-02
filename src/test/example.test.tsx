import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "./test-utils";
import React from "react";

// A simple component for testing
const Counter = () => {
  const [count, setCount] = React.useState(0);
  return (
    <div>
      <p data-testid="count">{count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
};

describe("Example Component Test", () => {
  // Arrange, Act, Assert pattern
  it("should render the counter with initial value", () => {
    // Arrange
    render(<Counter />);

    // Act - not needed for initial render

    // Assert
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("should increment counter when button is clicked", () => {
    // Arrange
    render(<Counter />);

    // Act
    fireEvent.click(screen.getByRole("button", { name: /increment/i }));

    // Assert
    expect(screen.getByTestId("count")).toHaveTextContent("1");
  });

  it("demonstrates mocking a function", () => {
    // Arrange
    const mockFn = vi.fn();

    // Act
    mockFn("test");

    // Assert
    expect(mockFn).toHaveBeenCalledWith("test");
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
