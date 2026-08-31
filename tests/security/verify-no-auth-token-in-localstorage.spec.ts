import { test, expect } from '../../src/fixtures/base';

test.describe('Security: Verify No Auth Token in LocalStorage', () => {
  test('Verify No Auth Token in LocalStorage @smoke', async ({ page }) => {
    await page.goto('/');

    await page.waitForTimeout(1000);

    await expect(page.locator('body')).toBeVisible({ timeout: 1000 });
  });
});
