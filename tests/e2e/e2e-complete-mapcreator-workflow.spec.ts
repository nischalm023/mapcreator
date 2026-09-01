import { test, expect } from '../../src/fixtures/base';

test.describe('E2E: E2E Complete MapCreator Workflow', () => {
  test('E2E Complete MapCreator Workflow @critical', async ({ page }) => {
    await test.step('Navigate to MapCreator', async () => {
      await page.goto('http://localhost:3060/new?new_mapcreator=true');
    });

    await test.step('Wait for application to load', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Open File dropdown', async () => {
      await page.locator('button:has-text(\'File\'), [data-testid=\'file-dropdown\']').click();
    });

    await test.step('Click Add Map', async () => {
      await page.locator('li:has-text(\'Add Map\'), [data-testid=\'add-map\']').click();
    });

    await test.step('Select AGV - RTP, Relay, TTP', async () => {
      await page.locator('li:has-text(\'AGV - RTP\'), button:has-text(\'AGV\')').click();
    });

    await test.step('Wait for configuration form', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Enter map name', async () => {
      await page.locator('input[name=\'name\']').fill('E2E Test Map');
    });

    await test.step('Enter MSU dimension', async () => {
      await page.locator('input[name=\'msuDimension\']').fill('100');
    });

    await test.step('Enter barcode distance', async () => {
      await page.locator('input[name=\'barcodeDistance\']').fill('50');
    });

    await test.step('Enter 10 rows', async () => {
      await page.locator('input[name=\'rowCount\']').fill('10');
    });

    await test.step('Enter 10 columns', async () => {
      await page.locator('input[name=\'columnCount\']').fill('10');
    });

    await test.step('Create the map', async () => {
      await page.locator('button:has-text(\'Create\')').click();
    });

    await test.step('Wait for map creation', async () => {
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

    await test.step('Place sub area on warehouse', async () => {
      await page.locator('.warehouse-area canvas').click();
    });

    await test.step('Wait for sub area placement', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Select sub area', async () => {
      await page.locator('.sub-area').click();
    });

    await test.step('Open File menu', async () => {
      await page.locator('button:has-text(\'File\')').click();
    });

    await test.step('Click Edit Map', async () => {
      await page.locator('li:has-text(\'Edit Map\')').click();
    });

    await test.step('Wait for sub area editor', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Select barcode 006.008', async () => {
      await page.locator('[data-barcode=\'006.008\'], [data-row=\'6\'][data-col=\'8\']').click();
    });

    await test.step('Verify barcode properties are shown in right sidebar', async () => {
      await expect(page.locator('.properties-panel')).toBeVisible({ timeout: 1000 });
    });
  });
});
