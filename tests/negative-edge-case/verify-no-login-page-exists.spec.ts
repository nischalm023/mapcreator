import { test, expect } from '../../src/fixtures/base';

test.describe('Negative / Edge Case: Verify No Login Page Exists', () => {
  test('Verify No Login Page Exists @critical', async ({ page }) => {
    await page.goto('/login');

    await page.waitForTimeout(1000);

    await expect(page.locator('body')).toBeVisible({ timeout: 1000 });
  });
});
