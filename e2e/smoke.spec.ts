import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('homepage redirects to sign-in for unauthenticated users', async ({
    page,
  }) => {
    await page.goto('/');
    // Should redirect to sign-in
    await expect(page).toHaveURL(/sign-in/);
  });

  test('sign-in page loads correctly', async ({ page }) => {
    await page.goto('/sign-in');
    // Clerk sign-in page should be visible
    await expect(page).toHaveURL(/sign-in/);
  });

  test('sign-up page loads correctly', async ({ page }) => {
    await page.goto('/sign-up');
    // Clerk sign-up page should be visible
    await expect(page).toHaveURL(/sign-up/);
  });

  test('onboarding page loads correctly', async ({ page }) => {
    await page.goto('/onboarding');
    // Onboarding page should show welcome content
    await expect(page.getByText(/Welcome/i)).toBeVisible();
  });
});

test.describe('PWA', () => {
  test('manifest is accessible', async ({ page }) => {
    const response = await page.goto('/manifest.json');
    expect(response?.status()).toBe(200);

    const manifest = await response?.json();
    expect(manifest.name).toBe('SME Cash Flow Dashboard');
    expect(manifest.short_name).toBe('CashFlow');
  });

  test('PWA icons are accessible', async ({ page }) => {
    const iconSizes = ['192x192', '512x512'];

    for (const size of iconSizes) {
      const response = await page.goto(`/icons/icon-${size}.png`);
      expect(response?.status()).toBe(200);
      expect(response?.headers()['content-type']).toContain('image/png');
    }
  });
});
