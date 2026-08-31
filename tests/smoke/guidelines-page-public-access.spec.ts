import { test, expect } from '../../src/fixtures/base';

test.describe('Smoke: Guidelines Page Public Access', () => {
  test('Guidelines Page Public Access @regression', async ({ page }) => {
    await page.goto('/guidelines');

    await page.waitForTimeout(1000);

    await expect(page.locator('h1, h2, p, [data-testid=\'guidelines-content\']')).toBeVisible({ timeout: 1000 });
  });
});
