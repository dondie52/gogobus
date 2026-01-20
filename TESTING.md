# GOGOBUS Testing Guide

This document provides an overview of the testing infrastructure and how to run tests for the GOGOBUS application.

## Testing Overview

GOGOBUS uses a comprehensive testing strategy with three levels of testing:

1. **Unit Tests** - Test individual functions and utilities
2. **Integration Tests** - Test complete flows and service interactions
3. **E2E Tests** - Test user journeys end-to-end

## Test Frameworks

- **Vitest** - Unit and integration testing (fast, Vite-native)
- **React Testing Library** - Component testing utilities
- **Playwright** - End-to-end browser testing

## Running Tests

### Unit and Integration Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test -- --watch

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

# Run E2E tests in headed mode (see browser)
npm run test:e2e -- --headed
```

### Run All Tests

```bash
npm run test:all
```

## Test Structure

```
gogobus/
├── src/
│   ├── utils/
│   │   └── __tests__/
│   │       ├── validation.test.js
│   │       └── pricing.test.js
│   ├── services/
│   │   └── __tests__/
│   │       ├── bookingService.test.js
│   │       └── paymentService.test.js
│   └── test/
│       ├── setup.js
│       └── integration/
│           └── bookingFlow.test.jsx
├── e2e/
│   ├── auth.spec.js
│   ├── booking.spec.js
│   └── admin.spec.js
├── vitest.config.js
└── playwright.config.js
```

## Writing Tests

### Unit Tests

Unit tests are located in `__tests__` directories next to the code they test.

Example:
```javascript
import { describe, it, expect } from 'vitest';
import { validateEmail } from '../validation';

describe('validateEmail', () => {
  it('should validate correct email addresses', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });
});
```

### Integration Tests

Integration tests test complete flows and are located in `src/test/integration/`.

Example:
```javascript
import { describe, it, expect } from 'vitest';
import bookingService from '../../services/bookingService';

describe('Booking Flow Integration', () => {
  it('should complete full booking flow', async () => {
    // Test complete flow
  });
});
```

### E2E Tests

E2E tests use Playwright and are located in the `e2e/` directory.

Example:
```javascript
import { test, expect } from '@playwright/test';

test('should display login page', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('input[type="email"]')).toBeVisible();
});
```

## Test Coverage Goals

- **Unit Tests**: 80%+ coverage for utilities and services
- **Integration Tests**: All critical flows covered
- **E2E Tests**: All user journeys covered

## Current Test Coverage

Run `npm run test:coverage` to see current coverage report.

### Coverage by Category

- ✅ Validation utilities: Comprehensive
- ✅ Pricing utilities: Comprehensive
- ✅ Booking service: Core functions
- ✅ Payment service: Core functions
- ⏳ Component tests: In progress
- ⏳ E2E tests: Basic flows

## Mocking

### Supabase Mocking

Supabase is mocked in tests to avoid actual database calls:

```javascript
vi.mock('../services/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getSession: vi.fn(),
    },
  },
}));
```

### Service Mocking

Services can be mocked for isolated testing:

```javascript
vi.mock('../../services/bookingService');
bookingService.createBooking.mockResolvedValue(mockBooking);
```

## CI/CD Integration

Tests should run automatically in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: npm run test

- name: Run E2E tests
  run: npm run test:e2e
```

## Debugging Tests

### Unit Tests

```bash
# Run specific test file
npm run test -- validation.test.js

# Run tests matching pattern
npm run test -- --grep "validateEmail"

# Debug in VS Code
# Use "JavaScript Debug Terminal" and run tests
```

### E2E Tests

```bash
# Run in headed mode
npm run test:e2e -- --headed

# Run with debug mode
npm run test:e2e -- --debug

# Run specific test
npm run test:e2e -- auth.spec.js
```

## Best Practices

1. **Test Behavior, Not Implementation**
   - Test what the code does, not how it does it
   - Focus on user-facing behavior

2. **Keep Tests Isolated**
   - Each test should be independent
   - Use `beforeEach` to set up clean state

3. **Use Descriptive Test Names**
   - Test names should clearly describe what is being tested
   - Use "should" or "it" format

4. **Mock External Dependencies**
   - Mock API calls, database, and external services
   - Keep tests fast and reliable

5. **Test Edge Cases**
   - Test error conditions
   - Test boundary values
   - Test invalid inputs

6. **Maintain Test Coverage**
   - Aim for 80%+ coverage
   - Focus on critical paths first

## Troubleshooting

### Tests Failing After Changes

1. Check if mocks need updating
2. Verify test data is still valid
3. Check for breaking changes in dependencies

### E2E Tests Flaky

1. Add explicit waits instead of fixed timeouts
2. Use `waitForLoadState` for page loads
3. Check for race conditions

### Coverage Not Updating

1. Ensure coverage provider is installed: `@vitest/coverage-v8`
2. Check `vitest.config.js` coverage settings
3. Verify files aren't excluded

## Next Steps

- [ ] Add component tests for React components
- [ ] Expand E2E test coverage
- [ ] Add performance tests
- [ ] Set up CI/CD test automation
- [ ] Add visual regression tests

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
