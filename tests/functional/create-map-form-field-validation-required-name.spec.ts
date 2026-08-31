import { test, expect } from '../../src/fixtures/base';

test.describe('Functional: Create Map Form - Field Validation Required Name', () => {
  test('Create Map Form - Field Validation Required Name @smoke', async ({ page }) => {
    await test.step('Navigate to create map page', async () => {
      await page.goto('/new');
    });

    await test.step('Create map form', async () => {
      await expect(page.locator('form, [data-testid=\'create-map-form\']')).toBeVisible({ timeout: 1000 });
    });

    await test.step('Click submit without filling required fields', async () => {
      await page.locator('button[type=\'submit\'], button:has-text(\'Create\'), button:has-text(\'Submit\')').click();
    });

    await test.step('Wait for validation error to appear', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Validation error message for required name field', async () => {
      await expect(page.locator('.error, [class*=\'error\'], [role=\'alert\'], [data-testid=\'name-error\']')).toBeVisible({ timeout: 1000 });
    });
  });
});
