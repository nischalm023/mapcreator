import { test, expect } from '../../src/fixtures/base';

test.describe('E2E: AutoCAD Import Route - Verify Public Access', () => {
  test('AutoCAD Import Route - Verify Public Access @regression', async ({ page }) => {
    await page.goto('/autocad_import');

    await expect(page.locator('form, input[type=\'file\'], [data-testid=\'autocad-import-form\']')).toBeVisible({ timeout: 1000 });

    await expect(page.locator('button, input[type=\'submit\']')).toBeVisible({ timeout: 1000 });
  });
});
