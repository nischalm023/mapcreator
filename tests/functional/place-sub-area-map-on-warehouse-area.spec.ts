import { test, expect } from '../../src/fixtures/base';

test.describe('Functional: Place Sub Area Map on Warehouse Area', () => {
  test('Place Sub Area Map on Warehouse Area @critical', async ({ page }) => {
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
      await page.locator('button:has-text(\'AGV\'), li:has-text(\'AGV - RTP\')').click();
    });

    await test.step('Wait for form', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Enter map name', async () => {
      await page.locator('input[name=\'name\']').fill('SubArea Placement Test');
    });

    await test.step('Enter row count', async () => {
      await page.locator('input[name=\'rowCount\']').fill('10');
    });

    await test.step('Enter column count', async () => {
      await page.locator('input[name=\'columnCount\']').fill('10');
    });

    await test.step('Create the map', async () => {
      await page.locator('button:has-text(\'Create\')').click();
    });

    await test.step('Wait for warehouse area to load', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Set Length to 30', async () => {
      await page.locator('input[name=\'length\']').fill('30');
    });

    await test.step('Set Width to 30', async () => {
      await page.locator('input[name=\'width\']').fill('30');
    });

    await test.step('Set Height to 20', async () => {
      await page.locator('input[name=\'height\']').fill('20');
    });

    await test.step('Click on warehouse area to place sub area map', async () => {
      await page.locator('.warehouse-area canvas, .warehouse-canvas, [data-testid=\'warehouse-area\'], .map-canvas').click();
    });

    await test.step('Wait for sub area to be placed', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Verify sub area map is placed on the warehouse area', async () => {
      await expect(page.locator('.sub-area, .subarea-map, [data-testid=\'subarea\'], .placed-subarea')).toBeVisible({ timeout: 1000 });
    });
  });
});
