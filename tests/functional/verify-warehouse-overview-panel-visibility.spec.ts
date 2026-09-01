import { test, expect } from '../../src/fixtures/base';

test.describe('Functional: Verify Warehouse Overview Panel Visibility', () => {
  test('Verify Warehouse Overview Panel Visibility @smoke', async ({ page }) => {
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

    await test.step('Name', async () => {
      await page.locator('input[name=\'name\']').fill('Panel Test');
    });

    await test.step('MSU', async () => {
      await page.locator('input[name=\'msuDimension\']').fill('100');
    });

    await test.step('Barcode', async () => {
      await page.locator('input[name=\'barcodeDistance\']').fill('50');
    });

    await test.step('Rows', async () => {
      await page.locator('input[name=\'rows\']').fill('10');
    });

    await test.step('Columns', async () => {
      await page.locator('input[name=\'columns\']').fill('10');
    });

    await test.step('Create', async () => {
      await page.locator('button:has-text(\'Create\')').click();
    });

    await test.step('Creation wait', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Warehouse Overview panel visible', async () => {
      await expect(page.locator('[data-testid=\'warehouse-overview\'], .warehouse-overview-panel, .right-panel')).toBeVisible({ timeout: 1000 });
    });

    await test.step('Length field visible', async () => {
      await expect(page.locator('input[name=\'length\'], [data-testid=\'length-input\'], label:has-text(\'Length\')')).toBeVisible({ timeout: 1000 });
    });

    await test.step('Width field visible', async () => {
      await expect(page.locator('input[name=\'width\'], [data-testid=\'width-input\'], label:has-text(\'Width\')')).toBeVisible({ timeout: 1000 });
    });

    await test.step('Height field visible', async () => {
      await expect(page.locator('input[name=\'height\'], [data-testid=\'height-input\'], label:has-text(\'Height\')')).toBeVisible({ timeout: 1000 });
    });
  });
});
