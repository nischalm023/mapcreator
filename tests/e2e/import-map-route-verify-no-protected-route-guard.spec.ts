import { test, expect } from '../../src/fixtures/base';

test.describe('E2E: Import Map Route - Verify No Protected Route Guard', () => {
  test('Import Map Route - Verify No Protected Route Guard @smoke', async ({ page }) => {
    await page.goto('/existing');

    await expect(page.locator('form, input[type=\'file\'], [data-testid=\'import-form\']')).toBeVisible({ timeout: 1000 });

    await expect(page.locator('button[type=\'submit\'], button:has-text(\'Import\'), button:has-text(\'Upload\')')).toBeVisible({ timeout: 1000 });
  });
});
