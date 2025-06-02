# Testing Environment Setup

This document explains the testing setup for 10x Cards and provides troubleshooting tips for common issues.

## What's Included

1. **Unit Testing with Vitest**

   - Configuration in `vitest.config.ts`
   - Test utilities in `src/test/test-utils.tsx`
   - Global setup in `src/test/setup.ts`
   - Example test in `src/test/example.test.tsx`

2. **E2E Testing with Playwright**

   - Configuration in `playwright.config.ts`
   - Page Object Model in `e2e/page-objects/`
   - Example test in `e2e/example.spec.ts`
   - Basic test in `e2e/basic.spec.ts`

3. **CI/CD Integration**
   - GitHub workflow in `.github/workflows/testing.yml`

## Installed Dependencies

The following packages were installed for testing:

```json
{
  "@testing-library/dom": "^9.3.4",
  "@testing-library/jest-dom": "^6.4.2",
  "@testing-library/react": "^16.3.0",
  "@vitejs/plugin-react": "^4.5.0",
  "@vitest/coverage-v8": "^3.2.0",
  "@vitest/ui": "^3.2.0",
  "happy-dom": "^17.5.6",
  "jsdom": "^26.1.0",
  "msw": "^2.8.7",
  "vitest": "^3.2.0",
  "@playwright/test": "^1.52.0"
}
```

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug

# Run a specific test file
npx playwright test e2e/basic.spec.ts
```

## Troubleshooting

### Common Issues

1. **Missing dependencies**

   - If you encounter "Cannot find module" errors, install the missing dependency with:
     ```bash
     npm install -D [package-name] --legacy-peer-deps
     ```
   - The `--legacy-peer-deps` flag is necessary because React 19 has peer dependency conflicts with some testing libraries.

2. **React version conflicts**

   - The testing libraries are designed for React 18, but our project uses React 19.
   - Use `--legacy-peer-deps` when installing new testing-related packages.

3. **Path resolution issues**

   - Ensure that the `vitest.config.ts` has the correct path aliases that match your `tsconfig.json`.

4. **JSDOM environment issues**

   - If you encounter DOM-related errors, check that `environment: "jsdom"` is properly set in `vitest.config.ts`.

5. **Testing UI components**

   - Use the custom render function from `src/test/test-utils.tsx` instead of importing directly from React Testing Library.
   - This ensures consistent provider wrapping and configuration.

6. **Playwright not found**

   - If you see "playwright is not recognized as an internal or external command", make sure you've installed the necessary dependencies:
     ```bash
     npm install -D @playwright/test
     npx playwright install chromium
     ```
   - Use `npx playwright` to run commands to ensure the binary is found.

7. **E2E tests requiring a built application**

   - By default, Playwright tests try to run against your built application.
   - If you haven't built the app, you may need to modify the `playwright.config.ts` file to comment out the `webServer` section.
   - For simple tests that don't require your application, use the example in `e2e/basic.spec.ts`.

### Extending the Test Suite

1. **Adding a new component test**

   - Create a new file with the `.test.tsx` extension in the same directory as your component
   - Import the component and test utilities
   - Follow the AAA pattern (Arrange, Act, Assert)
   - Use specific assertions that test behavior rather than implementation details

2. **Adding a new E2E test**
   - Create a new page object in `e2e/page-objects/` if needed
   - Create a new test file with the `.spec.ts` extension in the `e2e/` directory
   - Follow the AAA pattern and use Playwright's expect assertions
