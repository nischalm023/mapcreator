import { test, expect } from '../../src/fixtures/base';

test.describe('E2E: Edit Warehouse Dimensions in Overview Panel', () => {
  test('Edit Warehouse Dimensions in Overview Panel @critical', async ({ page }) => {
    await test.step('MapCreator application new map page', async () => {
      await page.goto('http://localhost:3060/new?new_mapcreator=true');
    });

    await test.step('Wait for page to fully load', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('File dropdown menu button', async () => {
      await page.locator('[data-testid=\'file-dropdown\'], button:has-text(\'File\'), .file-menu').click();
    });

    await test.step('Add Map option', async () => {
      await page.locator('[data-testid=\'add-map-option\'], .dropdown-item:has-text(\'Add Map\'), li:has-text(\'Add Map\')').click();
    });

    await test.step('AGV - RTP, Relay, TTP map type', async () => {
      await page.locator('[data-testid=\'agv-rtp-option\'], .map-type-option:has-text(\'AGV\'), li:has-text(\'AGV - RTP, Relay, TTP\')').click();
    });

    await test.step('Wait for form', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Map name input', async () => {
      await page.locator('input[name=\'name\'], input[placeholder*=\'name\'], #mapName').fill('Warehouse Test Map');
    });

    await test.step('MSU dimension input', async () => {
      await page.locator('input[name=\'msuDimension\'], input[placeholder*=\'MSU\'], #msuDimension').fill('100');
    });

    await test.step('Barcode distance input', async () => {
      await page.locator('input[name=\'barcodeDistance\'], input[placeholder*=\'barcode\'], #barcodeDistance').fill('50');
    });

    await test.step('Row count input', async () => {
      await page.locator('input[name=\'rows\'], input[name=\'rowCount\'], #rowCount').fill('10');
    });

    await test.step('Column count input', async () => {
      await page.locator('input[name=\'columns\'], input[name=\'columnCount\'], #columnCount').fill('10');
    });

    await test.step('Create map button', async () => {
      await page.locator('button:has-text(\'Create\'), button[type=\'submit\']:has-text(\'Create\')').click();
    });

    await test.step('Wait for map creation', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Warehouse Overview right panel', async () => {
      await expect(page.locator('[data-testid=\'warehouse-overview\'], .warehouse-overview-panel, .right-panel, #warehouseOverview')).toBeVisible({ timeout: 1000 });
    });

    await test.step('Length input field in Warehouse Overview', async () => {
      await page.locator('[data-testid=\'length-input\'], input[name=\'length\'], input[placeholder*=\'Length\'], label:has-text(\'Length\') + input').click();
    });

    await test.step('Length input field', async () => {
      await page.locator('[data-testid=\'length-input\'], input[name=\'length\'], input[placeholder*=\'Length\']').fill('30');
    });

    await test.step('Width input field in Warehouse Overview', async () => {
      await page.locator('[data-testid=\'width-input\'], input[name=\'width\'], input[placeholder*=\'Width\'], label:has-text(\'Width\') + input').click();
    });

    await test.step('Width input field', async () => {
      await page.locator('[data-testid=\'width-input\'], input[name=\'width\'], input[placeholder*=\'Width\']').fill('30');
    });

    await test.step('Height input field in Warehouse Overview', async () => {
      await page.locator('[data-testid=\'height-input\'], input[name=\'height\'], input[placeholder*=\'Height\'], label:has-text(\'Height\') + input').click();
    });

    await test.step('Height input field', async () => {
      await page.locator('[data-testid=\'height-input\'], input[name=\'height\'], input[placeholder*=\'Height\']').fill('20');
    });

    await test.step('Length input should show 30', async () => {
      await expect(page.locator('[data-testid=\'length-input\'], input[name=\'length\']')).toHaveValue('30');
    });
  });
});
