import { test, expect } from '../../src/fixtures/base';

test.describe('E2E: Place Sub Area Map on Warehouse Area', () => {
  test('Place Sub Area Map on Warehouse Area @critical', async ({ page }) => {
    await test.step('MapCreator application new map page', async () => {
      await page.goto('http://localhost:3060/new?new_mapcreator=true');
    });

    await test.step('Wait for page to load', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('File dropdown menu', async () => {
      await page.locator('button:has-text(\'File\'), .file-menu, [data-testid=\'file-dropdown\']').click();
    });

    await test.step('Add Map option', async () => {
      await page.locator('.dropdown-item:has-text(\'Add Map\'), li:has-text(\'Add Map\')').click();
    });

    await test.step('AGV - RTP map type', async () => {
      await page.locator('.map-type-option:has-text(\'AGV\'), li:has-text(\'AGV - RTP, Relay, TTP\')').click();
    });

    await test.step('Wait for form', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Map name', async () => {
      await page.locator('input[name=\'name\'], #mapName').fill('SubArea Test Map');
    });

    await test.step('MSU dimension', async () => {
      await page.locator('input[name=\'msuDimension\'], #msuDimension').fill('100');
    });

    await test.step('Barcode distance', async () => {
      await page.locator('input[name=\'barcodeDistance\'], #barcodeDistance').fill('50');
    });

    await test.step('Row count', async () => {
      await page.locator('input[name=\'rows\'], #rowCount').fill('10');
    });

    await test.step('Column count', async () => {
      await page.locator('input[name=\'columns\'], #columnCount').fill('10');
    });

    await test.step('Create button', async () => {
      await page.locator('button:has-text(\'Create\'), button[type=\'submit\']').click();
    });

    await test.step('Wait for map creation', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Set Length to 30', async () => {
      await page.locator('input[name=\'length\'], [data-testid=\'length-input\']').fill('30');
    });

    await test.step('Set Width to 30', async () => {
      await page.locator('input[name=\'width\'], [data-testid=\'width-input\']').fill('30');
    });

    await test.step('Set Height to 20', async () => {
      await page.locator('input[name=\'height\'], [data-testid=\'height-input\']').fill('20');
    });

    await test.step('Click on warehouse area canvas to place sub area map', async () => {
      await page.locator('[data-testid=\'warehouse-canvas\'], .warehouse-area, canvas.warehouse, #warehouseCanvas').click();
    });

    await test.step('Wait for sub area to be placed', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Sub area map placed on warehouse canvas', async () => {
      await expect(page.locator('[data-testid=\'sub-area-map\'], .sub-area, .placed-subarea, rect.subarea')).toBeVisible({ timeout: 1000 });
    });
  });
});
