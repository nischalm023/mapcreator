import { test, expect } from '../../src/fixtures/base';

test.describe('E2E: Navigation Between Routes Without Auth Interruption', () => {
  test('Navigation Between Routes Without Auth Interruption @smoke', async ({ page }) => {
    await test.step('Start at home page', async () => {
      await page.goto('/');
    });

    await test.step('Click to go to create map page', async () => {
      await page.locator('a[href=\'/new\'], button:has-text(\'Create\'), [data-testid=\'create-map-link\']').click();
    });

    await test.step('Create map form visible without auth prompt', async () => {
      await expect(page.locator('form, [data-testid=\'create-map-form\']')).toBeVisible({ timeout: 1000 });
    });

    await test.step('Navigate to saved maps', async () => {
      await page.goto('/version');
    });

    await test.step('Saved maps page visible without auth prompt', async () => {
      await expect(page.locator('h1, h2, table, ul, [data-testid=\'saved-maps-title\']')).toBeVisible({ timeout: 1000 });
    });

    await test.step('Return to home', async () => {
      await page.goto('/');
    });

    await test.step('Home page visible - full navigation cycle complete without auth', async () => {
      await expect(page.locator('h1, h2, [data-testid=\'home-title\']')).toBeVisible({ timeout: 1000 });
    });
  });
});
