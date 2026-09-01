import { test, expect } from '../../src/fixtures/base';

test.describe('E2E: Create AGV Map with Custom Dimensions', () => {
  test('Create AGV Map with Custom Dimensions @critical', async ({ page }) => {
    await test.step('MapCreator application new map page', async () => {
      await page.goto('http://localhost:3060/new?new_mapcreator=true');
    });

    await test.step('Wait for page to fully load', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('File dropdown menu button in the toolbar', async () => {
      await page.locator('[data-testid=\'file-dropdown\'], button:has-text(\'File\'), .file-menu, #file-menu').click();
    });

    await test.step('Add Map option in File dropdown', async () => {
      await expect(page.locator('[data-testid=\'add-map-option\'], .dropdown-item:has-text(\'Add Map\'), li:has-text(\'Add Map\')')).toBeVisible({ timeout: 1000 });
    });

    await test.step('Add Map option to create a new map', async () => {
      await page.locator('[data-testid=\'add-map-option\'], .dropdown-item:has-text(\'Add Map\'), li:has-text(\'Add Map\')').click();
    });

    await test.step('AGV - RTP, Relay, TTP map type option', async () => {
      await expect(page.locator('[data-testid=\'agv-rtp-option\'], .map-type-option:has-text(\'AGV\'), li:has-text(\'AGV - RTP, Relay, TTP\')')).toBeVisible({ timeout: 1000 });
    });

    await test.step('AGV - RTP, Relay, TTP map type selection', async () => {
      await page.locator('[data-testid=\'agv-rtp-option\'], .map-type-option:has-text(\'AGV\'), li:has-text(\'AGV - RTP, Relay, TTP\')').click();
    });

    await test.step('Wait for map creation form to appear', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Map name input field', async () => {
      await page.locator('[data-testid=\'map-name-input\'], input[name=\'name\'], input[placeholder*=\'name\'], #mapName').fill('Test AGV Map');
    });

    await test.step('MSU dimension input field', async () => {
      await page.locator('[data-testid=\'msu-dimension-input\'], input[name=\'msuDimension\'], input[placeholder*=\'MSU\'], #msuDimension').fill('100');
    });

    await test.step('Barcode distance input field', async () => {
      await page.locator('[data-testid=\'barcode-distance-input\'], input[name=\'barcodeDistance\'], input[placeholder*=\'barcode\'], #barcodeDistance').fill('50');
    });

    await test.step('Row count input field', async () => {
      await page.locator('[data-testid=\'row-count-input\'], input[name=\'rows\'], input[name=\'rowCount\'], #rowCount').fill('10');
    });

    await test.step('Column count input field', async () => {
      await page.locator('[data-testid=\'column-count-input\'], input[name=\'columns\'], input[name=\'columnCount\'], #columnCount').fill('10');
    });

    await test.step('Create map button to finalize map creation', async () => {
      await page.locator('[data-testid=\'create-map-button\'], button:has-text(\'Create\'), button[type=\'submit\']:has-text(\'Create\')').click();
    });

    await test.step('Wait for map to be created', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Map canvas indicating successful map creation', async () => {
      await expect(page.locator('[data-testid=\'map-canvas\'], .map-container, canvas, #mapCanvas')).toBeVisible({ timeout: 1000 });
    });
  });
});
