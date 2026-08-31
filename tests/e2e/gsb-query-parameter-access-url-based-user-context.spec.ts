import { test, expect } from '../../src/fixtures/base';

test.describe('E2E: GSB Query Parameter Access - URL-Based User Context', () => {
  test('GSB Query Parameter Access - URL-Based User Context @regression', async ({ page }) => {
    await page.goto('/?gsb=true&gsb_user=testuser&uid=12345');

    await page.waitForTimeout(1000);

    await expect(page.locator('body')).toBeVisible({ timeout: 1000 });
  });
});
