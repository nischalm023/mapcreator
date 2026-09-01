import { test, expect } from '../../src/fixtures/base';

test.describe('Negative / Edge Case: Negative Test - Invalid Row Column Values', () => {
  test('Negative Test - Invalid Row Column Values @regression', async ({ page }) => {
    await test.step('MapCreator application', async () => {
      await page.goto('http://localhost:3060/new?new_mapcreator=true');
    });

    await test.step('Page load', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('File menu', async () => {
      await page.locator('button:has-text(\'File\')').click();
    });

    await test.step('Add Map', async () => {
      await page.locator('li:has-text(\'Add Map\')').click();
    });

    await test.step('AGV type', async () => {
      await page.locator('li:has-text(\'AGV - RTP\')').click();
    });

    await test.step('Form wait', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Map name', async () => {
      await page.locator('input[name=\'name\']').fill('Invalid Test');
    });

    await test.step('MSU', async () => {
      await page.locator('input[name=\'msuDimension\']').fill('100');
    });

    await test.step('Barcode', async () => {
      await page.locator('input[name=\'barcodeDistance\']').fill('50');
    });

    await test.step('Rows with invalid value', async () => {
      await page.locator('input[name=\'rows\']').fill('0');
    });

    await test.step('Columns with invalid value', async () => {
      await page.locator('input[name=\'columns\']').fill('-5');
    });

    await test.step('Create', async () => {
      await page.locator('button:has-text(\'Create\')').click();
    });

    await test.step('Validation error for invalid row/column values', async () => {
      await expect(page.locator('.error-message, .validation-error, .field-error')).toBeVisible({ timeout: 1000 });
    });
  });
});
