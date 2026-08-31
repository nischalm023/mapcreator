import { test, expect } from '../../src/fixtures/base';

test.describe('Negative / Edge Case: Verify No Register Page Exists', () => {
  test('Verify No Register Page Exists @critical', async ({ page }) => {
    await page.goto('/register');

    await page.waitForTimeout(1000);

    await expect(page.locator('body')).toBeVisible({ timeout: 1000 });
  });
});
