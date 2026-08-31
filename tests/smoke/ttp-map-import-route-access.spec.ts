import { test, expect } from '../../src/fixtures/base';

test.describe('Smoke: TTP Map Import Route Access', () => {
  test('TTP Map Import Route Access @regression', async ({ page }) => {
    await page.goto('/stitch_ttp_rtp_map');

    await page.waitForTimeout(1000);

    await expect(page.locator('form, input, button, h1, h2')).toBeVisible({ timeout: 1000 });
  });
});
