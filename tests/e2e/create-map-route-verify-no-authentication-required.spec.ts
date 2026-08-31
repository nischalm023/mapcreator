import { test, expect } from '../../src/fixtures/base';

test.describe('E2E: Create Map Route - Verify No Authentication Required', () => {
  test('Create Map Route - Verify No Authentication Required @critical', async ({ page }) => {
    await test.step('Navigate directly to create map page', async () => {
      await page.goto('/new');
    });

    await test.step('Create map form should be visible without authentication', async () => {
      await expect(page.locator('form, [data-testid=\'create-map-form\']')).toBeVisible({ timeout: 1000 });
    });

    await test.step('Map name input field', async () => {
      await expect(page.locator('input[name=\'name\'], input[placeholder*=\'name\'], #name, [data-testid=\'map-name-input\']')).toBeVisible({ timeout: 1000 });
    });

    await test.step('Submit button for creating map', async () => {
      await expect(page.locator('button[type=\'submit\'], button:has-text(\'Create\'), button:has-text(\'Submit\')')).toBeVisible({ timeout: 1000 });
    });
  });
});
