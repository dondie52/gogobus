/**
 * E2E tests for authentication flow
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await expect(page).toHaveTitle(/GOGOBUS/i);
    // Check for login elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should navigate to sign up page', async ({ page }) => {
    // Click sign up link/button
    const signUpLink = page.locator('text=/sign up|register/i').first();
    if (await signUpLink.isVisible()) {
      await signUpLink.click();
      await expect(page).toHaveURL(/signup|register/i);
    }
  });

  test('should show validation errors for invalid email', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"]').first();

    await emailInput.fill('invalid-email');
    await passwordInput.fill('password123');
    
    if (await submitButton.isVisible()) {
      await submitButton.click();
      
      // Wait for validation error
      await expect(page.locator('text=/invalid|error/i').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show validation errors for weak password', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"]').first();

    await emailInput.fill('test@example.com');
    await passwordInput.fill('123');
    
    if (await submitButton.isVisible()) {
      await submitButton.click();
      
      // Wait for password validation error
      await expect(page.locator('text=/password|weak|short/i').first()).toBeVisible({ timeout: 5000 });
    }
  });
});
