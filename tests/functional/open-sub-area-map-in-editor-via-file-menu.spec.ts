import { test, expect } from '../../src/fixtures/base';

test.describe('Functional: Open Sub Area Map in Editor via File Menu', () => {
  test('Open Sub Area Map in Editor via File Menu @critical', async ({ page }) => {
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
      await page.locator('input[name=\'name\']').fill('Edit SubArea Test');
    });

    await test.step('Row count', async () => {
      await page.locator('input[name=\'rowCount\']').fill('10');
    });

    await test.step('Column count', async () => {
      await page.locator('input[name=\'columnCount\']').fill('10');
    });

    await test.step('Create map', async () => {
      await page.locator('button:has-text(\'Create\')').click();
    });

    await test.step('Wait for warehouse area', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Click to place sub area', async () => {
      await page.locator('.warehouse-area canvas, .warehouse-canvas').click();
    });

    await test.step('Wait for sub area placement', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Click on the placed sub area map to select it', async () => {
      await page.locator('.sub-area, .subarea-map, [data-testid=\'subarea\']').click();
    });

    await test.step('Click File dropdown menu', async () => {
      await page.locator('button:has-text(\'File\')').click();
    });

    await test.step('Wait for dropdown', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Click Edit Map option', async () => {
      await page.locator('li:has-text(\'Edit Map\'), [data-testid=\'edit-map\'], button:has-text(\'Edit Map\')').click();
    });

    await test.step('Wait for sub area map editor to open', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Verify sub area map editor is opened with barcode grid', async () => {
      await expect(page.locator('.subarea-editor, .barcode-grid, [data-testid=\'subarea-map-editor\'], .map-editor-canvas')).toBeVisible({ timeout: 1000 });
    });
  });
});
