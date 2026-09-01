import { test, expect } from '../../src/fixtures/base';

test.describe('Negative / Edge Case: Negative Test - Invalid Row and Column Values', () => {
  test('Negative Test - Invalid Row and Column Values @regression', async ({ page }) => {
    await test.step('MapCreator new map page', async () => {
      await page.goto('http://localhost:3060/new?new_mapcreator=true');
    });

    await test.step('Wait for page to load', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Click File dropdown', async () => {
      await page.locator('button:has-text(\'File\')').click();
    });

    await test.step('Click Add Map', async () => {
      await page.locator('li:has-text(\'Add Map\')').click();
    });

    await test.step('Select AGV map type', async () => {
      await page.locator('li:has-text(\'AGV - RTP\')').click();
    });

    await test.step('Wait for form', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Enter map name', async () => {
      await page.locator('input[name=\'name\']').fill('Invalid Values Test');
    });

    await test.step('Enter invalid row count (0)', async () => {
      await page.locator('input[name=\'rowCount\']').fill('0');
    });

    await test.step('Enter invalid column count (-1)', async () => {
      await page.locator('input[name=\'columnCount\']').fill('-1');
    });

    await test.step('Attempt to create map', async () => {
      await page.locator('button:has-text(\'Create\')').click();
    });

    await test.step('Verify validation error for invalid row/column values', async () => {
      await expect(page.locator('.error-message, .validation-error, [role=\'alert\']')).toBeVisible({ timeout: 1000 });
    });
  });
});
