import { test, expect } from '../../src/fixtures/base';

test.describe('Functional: Edit Warehouse Dimensions in Right Panel', () => {
  test('Edit Warehouse Dimensions in Right Panel @critical', async ({ page }) => {
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
      await page.locator('input[name=\'name\'], input:first-of-type').fill('Warehouse Test Map');
    });

    await test.step('Enter row count', async () => {
      await page.locator('input[name=\'rowCount\']').fill('10');
    });

    await test.step('Enter column count', async () => {
      await page.locator('input[name=\'columnCount\']').fill('10');
    });

    await test.step('Create the map', async () => {
      await page.locator('button:has-text(\'Create\'), button[type=\'submit\']').click();
    });

    await test.step('Wait for Warehouse Overview panel', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Verify Warehouse Overview right panel is visible', async () => {
      await expect(page.locator('.warehouse-overview, .right-panel, [data-testid=\'warehouse-overview\']')).toBeVisible({ timeout: 1000 });
    });

    await test.step('Edit Length to 30', async () => {
      await page.locator('input[name=\'length\'], input[placeholder*=\'Length\'], #warehouse-length, .warehouse-overview input:nth-of-type(1)').fill('30');
    });

    await test.step('Edit Width to 30', async () => {
      await page.locator('input[name=\'width\'], input[placeholder*=\'Width\'], #warehouse-width, .warehouse-overview input:nth-of-type(2)').fill('30');
    });

    await test.step('Edit Height to 20', async () => {
      await page.locator('input[name=\'height\'], input[placeholder*=\'Height\'], #warehouse-height, .warehouse-overview input:nth-of-type(3)').fill('20');
    });

    await test.step('Verify Length is set to 30', async () => {
      await expect(page.locator('input[name=\'length\'], #warehouse-length')).toHaveValue('30');
    });
  });
});
