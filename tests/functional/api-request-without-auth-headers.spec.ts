import { test, expect } from '../../src/fixtures/base';

test.describe('Functional: API Request Without Auth Headers', () => {
  test('API Request Without Auth Headers @smoke', async ({ page }) => {
    await page.goto('/version');

    await page.waitForTimeout(1000);

    await expect(page.locator('table, ul, [data-testid=\'maps-list\'], .map-list, .no-maps, p')).toBeVisible({ timeout: 1000 });
  });
});
