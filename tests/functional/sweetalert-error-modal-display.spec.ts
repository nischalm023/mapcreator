import { test, expect } from '../../src/fixtures/base';

test.describe('Functional: SweetAlert Error Modal Display', () => {
  test('SweetAlert Error Modal Display @regression', async ({ page }) => {
    await test.step('Navigate to create map page', async () => {
      await page.goto('/new');
    });

    await test.step('Enter invalid or minimal data', async () => {
      await page.locator('input[name=\'name\'], input[placeholder*=\'name\'], #name').fill('');
    });

    await test.step('Attempt to submit invalid form', async () => {
      await page.locator('button[type=\'submit\'], button:has-text(\'Create\')').click();
    });

    await test.step('Wait for error display', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Error message or modal should be visible', async () => {
      await expect(page.locator('.swal2-container, [role=\'alert\'], .error, [class*=\'error\'], [data-testid=\'error-message\']')).toBeVisible({ timeout: 1000 });
    });
  });
});
