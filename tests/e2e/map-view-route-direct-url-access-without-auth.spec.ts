import { test, expect } from '../../src/fixtures/base';

test.describe('E2E: Map View Route - Direct URL Access Without Auth', () => {
  test('Map View Route - Direct URL Access Without Auth @smoke', async ({ page }) => {
    await page.goto('/map/1');

    await page.waitForTimeout(1000);

    await expect(page.locator('[data-testid=\'map-viewport\'], canvas, .map-container, .swal2-container, [class*=\'error\']')).toBeVisible({ timeout: 1000 });
  });
});
