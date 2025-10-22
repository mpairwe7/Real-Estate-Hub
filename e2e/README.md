# End-to-End Testing with Playwright

## Overview

This directory contains end-to-end (E2E) tests for the Real Estate Management System using Playwright.

## Test Files

- `auth.spec.ts` - Authentication and navigation tests
- `properties.spec.ts` - Property browsing and details tests
- `accessibility.spec.ts` - Accessibility and WCAG compliance tests

## Running Tests

```bash
# Run all E2E tests
yarn test:e2e

# Run with UI mode (recommended for development)
yarn test:e2e:ui

# Run in debug mode
yarn test:e2e:debug

# Run specific test file
npx playwright test auth.spec.ts

# Run specific test by name
npx playwright test -g "should display homepage"

# Run tests in a specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# View test report
yarn test:e2e:report
```

## Test Structure

Each test file follows this structure:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Test implementation
    await expect(page).toHaveURL('/');
  });
});
```

## Writing Tests

### Best Practices

1. **Use semantic selectors**: Prefer `getByRole`, `getByLabel`, `getByText` over CSS selectors
2. **Wait for elements**: Use `waitForLoadState`, `waitForTimeout` when needed
3. **Test user flows**: Focus on real user interactions
4. **Keep tests isolated**: Each test should be independent
5. **Use descriptive names**: Test names should clearly describe what they test

### Example Test

```typescript
test('should allow user to login', async ({ page }) => {
  // Navigate to login page
  await page.goto('/auth/login');
  
  // Fill in credentials
  await page.getByLabel(/email/i).fill('user@example.com');
  await page.getByLabel(/password/i).fill('password123');
  
  // Submit form
  await page.getByRole('button', { name: /login/i }).click();
  
  // Verify successful login
  await expect(page).toHaveURL(/.*dashboard/);
});
```

## Configuration

The Playwright configuration is in `playwright.config.ts` at the project root.

### Key Settings

- **Base URL**: `http://localhost:3000` (configurable via `BASE_URL` env var)
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Retries**: 2 on CI, 0 locally
- **Screenshots**: On failure only
- **Video**: Retained on failure
- **Trace**: On first retry

### Environment Variables

```bash
# Set base URL for tests
BASE_URL=https://your-vercel-url.vercel.app yarn test:e2e

# Run in CI mode
CI=true yarn test:e2e
```

## Test Coverage

### Current Coverage (Week 4)

- ✅ Homepage display
- ✅ Navigation tests
- ✅ Login page navigation
- ✅ Sign up page navigation
- ✅ Form validation
- ✅ Property browsing
- ✅ Property filtering (partial)
- ✅ Property search (partial)
- ✅ Property details view
- ✅ Image display
- ✅ Accessibility basics
- ✅ Keyboard navigation
- ✅ ARIA landmarks

### Planned Coverage

- ⏳ Authenticated user flows
- ⏳ Property CRUD operations (landlords)
- ⏳ Maintenance request creation
- ⏳ Payment processing
- ⏳ Profile management
- ⏳ File uploads
- ⏳ Advanced filtering
- ⏳ Map interactions

## Test Data

### Test Accounts (When Available)

```typescript
// Test user credentials
const testUser = {
  email: 'test@example.com',
  password: 'TestPassword123!',
};

const testLandlord = {
  email: 'landlord@example.com',
  password: 'LandlordPass123!',
};
```

### Creating Test Data

For tests that require specific data:

1. Use Supabase test database
2. Seed data before tests
3. Clean up after tests
4. Use unique identifiers

## Debugging Tests

### Debug Mode

```bash
# Run in debug mode (opens browser)
yarn test:e2e:debug
```

### UI Mode

```bash
# Run with Playwright UI (recommended)
yarn test:e2e:ui
```

Features:
- Visual test execution
- Time travel debugging
- Watch mode
- Filter tests
- View traces

### Screenshots and Videos

Failed tests automatically capture:
- Screenshots (in `test-results/`)
- Videos (in `test-results/`)
- Traces (viewable with `npx playwright show-trace`)

### View Trace

```bash
# View trace of a failed test
npx playwright show-trace test-results/auth-should-login/trace.zip
```

## CI/CD Integration

The E2E tests are integrated into the GitHub Actions workflow:

```yaml
# .github/workflows/ci-cd.yml
e2e-tests:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
    - run: yarn install
    - run: npx playwright install --with-deps
    - run: yarn test:e2e
    - uses: actions/upload-artifact@v4
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
```

## Troubleshooting

### Common Issues

**Issue**: Tests fail with "Timeout waiting for..."

**Solution**: Increase timeout or wait for specific state
```typescript
await page.waitForLoadState('networkidle');
await page.waitForTimeout(1000);
```

**Issue**: Element not found

**Solution**: Use more specific selectors or wait for element
```typescript
await page.waitForSelector('[data-testid="property-card"]');
await expect(page.getByRole('heading')).toBeVisible();
```

**Issue**: Tests pass locally but fail in CI

**Solution**: Check for:
- Environment variables
- Network conditions
- Browser differences
- Race conditions

### Useful Commands

```bash
# Install specific browsers
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit

# Update Playwright
yarn add -D @playwright/test@latest
npx playwright install

# Generate test code
npx playwright codegen http://localhost:3000

# Run headed (see browser)
npx playwright test --headed

# Run specific browser
npx playwright test --browser=firefox
```

## Accessibility Testing

### Manual Checks

Beyond automated tests, perform manual checks for:
- Screen reader compatibility (NVDA, JAWS, VoiceOver)
- Keyboard-only navigation
- Zoom functionality (up to 200%)
- Color blindness simulation
- High contrast mode

### Tools

- **axe-core**: Automated accessibility testing
- **Lighthouse**: Performance and accessibility audits
- **WAVE**: Web accessibility evaluation tool
- **Browser DevTools**: Accessibility inspector

### Installing axe-core

```bash
yarn add -D @axe-core/playwright

# Use in tests
import { injectAxe, checkA11y } from 'axe-playwright';

test('should not have accessibility violations', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);
  await checkA11y(page);
});
```

## Performance Testing

Monitor key metrics during E2E tests:

```typescript
test('page should load quickly', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(5000); // 5 seconds
});
```

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Testing Library](https://testing-library.com/)

## Contributing

When adding new features:

1. Write E2E tests first (TDD approach)
2. Test critical user flows
3. Include accessibility tests
4. Update this README
5. Run all tests before committing

---

**Test Coverage Goal**: 90% of critical user flows  
**Current Status**: Foundation complete, expanding coverage  
**Last Updated**: October 22, 2025
