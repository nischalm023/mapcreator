import { test, expect } from '../../src/fixtures/base';

test.describe('E2E: Select Barcode 006.008 and Verify Properties', () => {
  test('Select Barcode 006.008 and Verify Properties @critical', async ({ page }) => {
    await test.step('MapCreator application', async () => {
      await page.goto('http://localhost:3060/new?new_mapcreator=true');
    });

    await test.step('Wait for page', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('File menu', async () => {
      await page.locator('button:has-text(\'File\')').click();
    });

    await test.step('Add Map', async () => {
      await page.locator('li:has-text(\'Add Map\'), .dropdown-item:has-text(\'Add Map\')').click();
    });

    await test.step('AGV type', async () => {
      await page.locator('li:has-text(\'AGV - RTP\'), .map-type-option:has-text(\'AGV\')').click();
    });

    await test.step('Form wait', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Name', async () => {
      await page.locator('input[name=\'name\']').fill('Barcode Test Map');
    });

    await test.step('MSU', async () => {
      await page.locator('input[name=\'msuDimension\']').fill('100');
    });

    await test.step('Barcode dist', async () => {
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

    await test.step('Length', async () => {
      await page.locator('input[name=\'length\']').fill('30');
    });

    await test.step('Width', async () => {
      await page.locator('input[name=\'width\']').fill('30');
    });

    await test.step('Height', async () => {
      await page.locator('input[name=\'height\']').fill('20');
    });

    await test.step('Place subarea', async () => {
      await page.locator('.warehouse-area, canvas, [data-testid=\'warehouse-canvas\']').click();
    });

    await test.step('Placement wait', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Select sub area', async () => {
      await page.locator('.sub-area, .placed-subarea, [data-testid=\'sub-area-map\']').click();
    });

    await test.step('File menu', async () => {
      await page.locator('button:has-text(\'File\')').click();
    });

    await test.step('Edit Map', async () => {
      await page.locator('li:has-text(\'Edit Map\'), .dropdown-item:has-text(\'Edit Map\')').click();
    });

    await test.step('Editor wait', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Barcode 006.008 in the grid', async () => {
      await page.locator('[data-barcode=\'006.008\'], .barcode:has-text(\'006.008\'), rect[data-id=\'006.008\'], text:has-text(\'006.008\')').click();
    });

    await test.step('Selection wait', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Properties panel in right sidebar', async () => {
      await expect(page.locator('[data-testid=\'properties-panel\'], .properties-sidebar, .right-sidebar, #propertiesPanel')).toBeVisible({ timeout: 1000 });
    });

    await test.step('Barcode 006.008 properties displayed', async () => {
      await expect(page.locator('.barcode-properties, [data-testid=\'barcode-info\'], .property-value:has-text(\'006.008\')')).toBeVisible({ timeout: 1000 });
    });
  });
});
