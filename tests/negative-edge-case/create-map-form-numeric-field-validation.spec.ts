import { test, expect } from '../../src/fixtures/base';

test.describe('Negative / Edge Case: Create Map Form - Numeric Field Validation', () => {
  test('Create Map Form - Numeric Field Validation @regression', async ({ page }) => {
    await test.step('Navigate to create map page', async () => {
      await page.goto('/new');
    });

    await test.step('Enter valid map name', async () => {
      await page.locator('input[name=\'name\'], input[placeholder*=\'name\'], #name').fill('Test Map');
    });

    await test.step('Enter invalid non-numeric value for MSU dimension', async () => {
      await page.locator('input[name=\'msuDimension\'], #msuDimension').fill('invalid');
    });

    await test.step('Attempt to submit with invalid numeric data', async () => {
      await page.locator('button[type=\'submit\'], button:has-text(\'Create\')').click();
    });

    await test.step('Wait for validation error', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Numeric validation error should appear', async () => {
      await expect(page.locator('.error, [class*=\'error\'], [role=\'alert\'], .swal2-container')).toBeVisible({ timeout: 1000 });
    });
  });
});
