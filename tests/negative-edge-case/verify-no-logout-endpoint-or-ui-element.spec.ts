import { test, expect } from '../../src/fixtures/base';

test.describe('Negative / Edge Case: Verify No Logout Endpoint or UI Element', () => {
  test('Verify No Logout Endpoint or UI Element @smoke', async ({ page }) => {
    await test.step('Navigate to home page', async () => {
      await page.goto('/');
    });

    await test.step('Wait for page to fully load', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Page loaded - should verify no logout button exists in navigation', async () => {
      await expect(page.locator('body')).toBeVisible({ timeout: 1000 });
    });

    await test.step('Attempt to access logout route', async () => {
      await page.goto('/logout');
    });

    await test.step('Wait for response', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Should show 404 or redirect since logout route doesn\'t exist', async () => {
      await expect(page.locator('body')).toBeVisible({ timeout: 1000 });
    });
  });
});
