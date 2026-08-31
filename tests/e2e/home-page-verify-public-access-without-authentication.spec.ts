import { test, expect } from '../../src/fixtures/base';

test.describe('E2E: Home Page - Verify Public Access Without Authentication', () => {
  test('Home Page - Verify Public Access Without Authentication @critical', async ({ page }) => {
    await test.step('Navigate to the home page', async () => {
      await page.goto('/');
    });

    await test.step('Main heading or title element on home page', async () => {
      await expect(page.locator('h1, h2, [data-testid=\'home-title\']')).toBeVisible({ timeout: 1000 });
    });

    await test.step('Link or button to create new map', async () => {
      await expect(page.locator('a[href=\'/new\'], button:has-text(\'Create\'), [data-testid=\'create-map-link\']')).toBeVisible({ timeout: 1000 });
    });

    await test.step('Link or button to import existing map', async () => {
      await expect(page.locator('a[href=\'/existing\'], button:has-text(\'Import\'), [data-testid=\'import-map-link\']')).toBeVisible({ timeout: 1000 });
    });

    await test.step('Link or button to view saved maps', async () => {
      await expect(page.locator('a[href=\'/version\'], button:has-text(\'Saved\'), [data-testid=\'saved-maps-link\']')).toBeVisible({ timeout: 1000 });
    });
  });
});
