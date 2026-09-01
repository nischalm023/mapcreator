import { test, expect } from '../../src/fixtures/base';

test.describe('E2E: Open Sub Area Map in Editor via File Menu', () => {
  test('Open Sub Area Map in Editor via File Menu @critical', async ({ page }) => {
    await test.step('MapCreator application', async () => {
      await page.goto('http://localhost:3060/new?new_mapcreator=true');
    });

    await test.step('Wait for page load', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('File dropdown', async () => {
      await page.locator('button:has-text(\'File\'), .file-menu').click();
    });

    await test.step('Add Map', async () => {
      await page.locator('.dropdown-item:has-text(\'Add Map\'), li:has-text(\'Add Map\')').click();
    });

    await test.step('AGV map type', async () => {
      await page.locator('.map-type-option:has-text(\'AGV\'), li:has-text(\'AGV - RTP\')').click();
    });

    await test.step('Wait for form', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Map name', async () => {
      await page.locator('input[name=\'name\'], #mapName').fill('Edit SubArea Test');
    });

    await test.step('MSU dimension', async () => {
      await page.locator('input[name=\'msuDimension\']').fill('100');
    });

    await test.step('Barcode distance', async () => {
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

    await test.step('Wait for creation', async () => {
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

    await test.step('Warehouse canvas to place sub area', async () => {
      await page.locator('[data-testid=\'warehouse-canvas\'], .warehouse-area, canvas').click();
    });

    await test.step('Wait for placement', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Click on placed sub area map to select it', async () => {
      await page.locator('[data-testid=\'sub-area-map\'], .sub-area, .placed-subarea, rect.subarea').click();
    });

    await test.step('File dropdown menu', async () => {
      await page.locator('button:has-text(\'File\'), .file-menu').click();
    });

    await test.step('Edit Map option visible', async () => {
      await expect(page.locator('.dropdown-item:has-text(\'Edit Map\'), li:has-text(\'Edit Map\')')).toBeVisible({ timeout: 1000 });
    });

    await test.step('Edit Map option', async () => {
      await page.locator('.dropdown-item:has-text(\'Edit Map\'), li:has-text(\'Edit Map\')').click();
    });

    await test.step('Wait for sub area editor to open', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Sub area map editor view', async () => {
      await expect(page.locator('[data-testid=\'subarea-editor\'], .subarea-map-editor, .map-editor-view')).toBeVisible({ timeout: 1000 });
    });
  });
});
