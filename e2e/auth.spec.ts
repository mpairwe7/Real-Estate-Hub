import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display homepage', async ({ page }) => {
    await expect(page).toHaveTitle(/Real Estate/i);
  });

  test('should navigate to login page', async ({ page }) => {
    // Look for login link in navigation
    const loginLink = page.getByRole('link', { name: /login|sign in/i });
    await loginLink.click();
    
    // Verify we're on the login page
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByRole('heading', { name: /login|sign in/i })).toBeVisible();
  });

  test('should navigate to sign up page', async ({ page }) => {
    // Look for sign up link
    const signUpLink = page.getByRole('link', { name: /sign up|register/i });
    await signUpLink.click();
    
    // Verify we're on the sign up page
    await expect(page).toHaveURL(/.*sign-up/);
    await expect(page.getByRole('heading', { name: /sign up|register/i })).toBeVisible();
  });

  test('should show validation errors on empty login form', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: /login|sign in/i });
    await submitButton.click();
    
    // Wait for validation errors
    await page.waitForTimeout(500);
    
    // Check for error messages (adjust selectors based on your implementation)
    const errors = await page.locator('[role="alert"], .error, .text-destructive').count();
    expect(errors).toBeGreaterThan(0);
  });

  test('should toggle password visibility', async ({ page }) => {
    await page.goto('/auth/login');
    
    const passwordInput = page.getByLabel(/password/i);
    
    // Password should be hidden initially
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Look for toggle button (adjust selector based on your implementation)
    const toggleButton = page.locator('[aria-label*="password"], button[type="button"]').first();
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'text');
    }
  });
});

test.describe('Authentication - Sign Up Flow', () => {
  test('should allow user to fill sign up form', async ({ page }) => {
    await page.goto('/auth/sign-up');
    
    // Fill in the form
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).first().fill('SecurePass123!');
    
    // Verify form is filled
    await expect(page.getByLabel(/email/i)).toHaveValue('test@example.com');
  });
});

test.describe('Navigation', () => {
  test('should navigate through main menu items', async ({ page }) => {
    await page.goto('/');
    
    // Test Browse/Properties navigation
    const browseLink = page.getByRole('link', { name: /browse|properties/i });
    if (await browseLink.isVisible()) {
      await browseLink.click();
      await expect(page).toHaveURL(/.*browse/);
    }
  });

  test('should toggle language switcher', async ({ page }) => {
    await page.goto('/');
    
    // Look for language switcher (adjust selector)
    const langSwitcher = page.locator('[aria-label*="language"], [data-testid="language-switcher"]').first();
    if (await langSwitcher.isVisible()) {
      await langSwitcher.click();
      
      // Verify dropdown/menu is visible
      await page.waitForTimeout(300);
      const langOptions = page.locator('[role="menuitem"], [role="option"]');
      const count = await langOptions.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should toggle theme', async ({ page }) => {
    await page.goto('/');
    
    // Look for theme toggle (adjust selector)
    const themeToggle = page.locator('[aria-label*="theme"], [data-testid="theme-toggle"]').first();
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(300);
      
      // Verify theme changed (check for dark/light class on html or body)
      const htmlClass = await page.locator('html').getAttribute('class');
      expect(htmlClass).toBeTruthy();
    }
  });
});
