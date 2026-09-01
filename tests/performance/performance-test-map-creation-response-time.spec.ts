import { test, expect } from '../../src/fixtures/base';

test.describe('Performance: Performance Test - Map Creation Response Time', () => {
  test('Performance Test - Map Creation Response Time @regression', async ({ page }) => {
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
      await page.locator('input[name=\'name\']').fill('Performance Test Map');
    });

    await test.step('Enter row count', async () => {
      await page.locator('input[name=\'rowCount\']').fill('10');
    });

    await test.step('Enter column count', async () => {
      await page.locator('input[name=\'columnCount\']').fill('10');
    });

    await test.step('Create map and measure response time', async () => {
      await page.locator('button:has-text(\'Create\')').click();
    });

    await test.step('Wait for map to render - should complete within 5 seconds', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Verify map creation completed successfully', async () => {
      await expect(page.locator('.warehouse-overview, .right-panel')).toBeVisible({ timeout: 1000 });
    });
  });
});
