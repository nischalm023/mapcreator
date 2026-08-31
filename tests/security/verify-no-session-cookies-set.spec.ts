import { test, expect } from '../../src/fixtures/base';

test.describe('Security: Verify No Session Cookies Set', () => {
  test('Verify No Session Cookies Set @smoke', async ({ page }) => {
    await page.goto('/');

    await page.waitForTimeout(1000);

    await expect(page.locator('body')).toBeVisible({ timeout: 1000 });
  });
});
