import { test, expect } from '../../src/fixtures/base';

test.describe('Functional: Test Barcode Grid Navigation in Sub Area Editor', () => {
  test('Test Barcode Grid Navigation in Sub Area Editor @regression', async ({ page }) => {
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
      await page.locator('input[name=\'name\']').fill('Navigation Test Map');
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

    await test.step('Wait for warehouse', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Place sub area', async () => {
      await page.locator('.warehouse-area canvas').click();
    });

    await test.step('Wait for sub area', async () => {
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

    await test.step('Wait for barcode grid', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Click on first barcode 001.001', async () => {
      await page.locator('[data-barcode=\'001.001\'], [data-row=\'1\'][data-col=\'1\']').click();
    });

    await test.step('Verify properties panel shows barcode info', async () => {
      await expect(page.locator('.properties-panel')).toBeVisible({ timeout: 1000 });
    });

    await test.step('Click on barcode 006.008', async () => {
      await page.locator('[data-barcode=\'006.008\'], [data-row=\'6\'][data-col=\'8\']').click();
    });

    await test.step('Verify barcode 006.008 properties are displayed', async () => {
      await expect(page.locator('.properties-panel [data-testid=\'barcode-id\'], .barcode-id')).toContainText('006.008');
    });
  });
});
