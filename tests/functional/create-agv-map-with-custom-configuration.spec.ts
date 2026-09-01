import { test, expect } from '../../src/fixtures/base';

test.describe('Functional: Create AGV Map with Custom Configuration', () => {
  test('Create AGV Map with Custom Configuration @critical', async ({ page }) => {
    await test.step('MapCreator new map page', async () => {
      await page.goto('http://localhost:3060/new?new_mapcreator=true');
    });

    await test.step('Wait for page to load', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Click on File dropdown', async () => {
      await page.locator('button:has-text(\'File\'), [data-testid=\'file-dropdown\']').click();
    });

    await test.step('Click on Add Map option', async () => {
      await page.locator('li:has-text(\'Add Map\'), [data-testid=\'add-map\']').click();
    });

    await test.step('Select AGV - RTP, Relay, TTP option', async () => {
      await page.locator('button:has-text(\'AGV\'), li:has-text(\'AGV - RTP\')').click();
    });

    await test.step('Wait for configuration form to appear', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Enter map name', async () => {
      await page.locator('input[name=\'name\'], input[placeholder*=\'name\'], #map-name, input:first-of-type').fill('Test AGV Map');
    });

    await test.step('Enter MSU dimension value', async () => {
      await page.locator('input[name=\'msuDimension\'], input[placeholder*=\'MSU\'], #msu-dimension, input[name=\'msu\']').fill('100');
    });

    await test.step('Enter barcode distance value', async () => {
      await page.locator('input[name=\'barcodeDistance\'], input[placeholder*=\'barcode\'], #barcode-distance').fill('50');
    });

    await test.step('Enter row count as 10', async () => {
      await page.locator('input[name=\'rowCount\'], input[placeholder*=\'row\'], #row-count').fill('10');
    });

    await test.step('Enter column count as 10', async () => {
      await page.locator('input[name=\'columnCount\'], input[placeholder*=\'column\'], #column-count').fill('10');
    });

    await test.step('Click Create button to create the map', async () => {
      await page.locator('button:has-text(\'Create\'), button[type=\'submit\'], [data-testid=\'create-map-btn\']').click();
    });

    await test.step('Wait for map to be created and displayed', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Verify map is created and warehouse overview panel is visible', async () => {
      await expect(page.locator('.map-canvas, .warehouse-overview, [data-testid=\'warehouse-panel\']')).toBeVisible({ timeout: 1000 });
    });
  });
});
