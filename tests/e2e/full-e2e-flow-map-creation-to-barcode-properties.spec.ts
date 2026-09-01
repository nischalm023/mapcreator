import { test, expect } from '../../src/fixtures/base';

test.describe('E2E: Full E2E Flow - Map Creation to Barcode Properties', () => {
  test('Full E2E Flow - Map Creation to Barcode Properties @critical', async ({ page }) => {
    await test.step('MapCreator application', async () => {
      await page.goto('http://localhost:3060/new?new_mapcreator=true');
    });

    await test.step('Initial page load', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Open File menu', async () => {
      await page.locator('button:has-text(\'File\'), [data-testid=\'file-dropdown\']').click();
    });

    await test.step('Select Add Map', async () => {
      await page.locator('li:has-text(\'Add Map\')').click();
    });

    await test.step('Select AGV map type', async () => {
      await page.locator('li:has-text(\'AGV - RTP, Relay, TTP\')').click();
    });

    await test.step('Wait for creation form', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Enter map name', async () => {
      await page.locator('input[name=\'name\']').fill('Complete E2E Test Map');
    });

    await test.step('Enter MSU dimension', async () => {
      await page.locator('input[name=\'msuDimension\']').fill('100');
    });

    await test.step('Enter barcode distance', async () => {
      await page.locator('input[name=\'barcodeDistance\']').fill('50');
    });

    await test.step('Enter row count', async () => {
      await page.locator('input[name=\'rows\']').fill('10');
    });

    await test.step('Enter column count', async () => {
      await page.locator('input[name=\'columns\']').fill('10');
    });

    await test.step('Create the map', async () => {
      await page.locator('button:has-text(\'Create\')').click();
    });

    await test.step('Wait for map creation', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Set warehouse length', async () => {
      await page.locator('input[name=\'length\']').fill('30');
    });

    await test.step('Set warehouse width', async () => {
      await page.locator('input[name=\'width\']').fill('30');
    });

    await test.step('Set warehouse height', async () => {
      await page.locator('input[name=\'height\']').fill('20');
    });

    await test.step('Click on warehouse to place sub area', async () => {
      await page.locator('.warehouse-area, canvas, [data-testid=\'warehouse-canvas\']').click();
    });

    await test.step('Wait for sub area placement', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Select the placed sub area', async () => {
      await page.locator('.sub-area, .placed-subarea, [data-testid=\'sub-area-map\']').click();
    });

    await test.step('Open File menu again', async () => {
      await page.locator('button:has-text(\'File\')').click();
    });

    await test.step('Select Edit Map to open sub area editor', async () => {
      await page.locator('li:has-text(\'Edit Map\')').click();
    });

    await test.step('Wait for sub area editor', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Select barcode 006.008', async () => {
      await page.locator('[data-barcode=\'006.008\'], .barcode:has-text(\'006.008\'), text:has-text(\'006.008\')').click();
    });

    await test.step('Verify properties panel shows selected barcode info', async () => {
      await expect(page.locator('.properties-sidebar, [data-testid=\'properties-panel\'], .right-sidebar')).toBeVisible({ timeout: 1000 });
    });

    await test.step('Final screenshot of barcode properties', async () => {
      await page.screenshot();
    });
  });
});
