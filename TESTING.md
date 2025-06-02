# Testing Guide for 10x Cards

This document provides guidelines for running and writing tests for the 10x Cards application.

## Testing Stack

- **Unit Testing**: Vitest with React Testing Library
- **E2E Testing**: Playwright

## Unit Testing with Vitest

Unit tests focus on testing individual components and functions in isolation.

### Running Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (during development)
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Test File Structure

- Unit tests are located in the same directory as the file they test
- Test files use the naming convention `*.test.ts` or `*.test.tsx`
- Test files should follow the AAA pattern (Arrange, Act, Assert)

### Best Practices

- Use `vi.mock()` for mocking dependencies
- Use `vi.fn()` for creating mock functions
- Use `vi.spyOn()` for spying on existing functions
- Use appropriate assertions from React Testing Library
- Leverage the custom render function from `src/test/test-utils.tsx`

## E2E Testing with Playwright

E2E tests verify the application works correctly from end to end.

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug
```

### Test Structure

- E2E tests are located in the `e2e` directory
- Page objects are located in `e2e/page-objects`
- Test files use the naming convention `*.spec.ts`

### Best Practices

- Follow the Page Object Model pattern
- Use locators for element selection
- Implement visual comparison with screenshots
- Create isolated test environments with browser contexts
- Use `expect` assertions with specific matchers

## CI/CD Integration

Tests are automatically run in the CI/CD pipeline when code is pushed to the repository.

## Writing Good Tests

1. Follow the AAA pattern (Arrange, Act, Assert)
2. Test behavior, not implementation
3. Write focused tests that test one thing
4. Avoid testing third-party code
5. Make tests independent and isolated
6. Use meaningful test descriptions
7. Handle errors and edge cases
