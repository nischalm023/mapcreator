import { test, expect } from '../../src/fixtures/base';

test.describe('Functional: Add AGV-RTP Relay TTP Map via File Dropdown', () => {
  test('Add AGV-RTP Relay TTP Map via File Dropdown @critical', async ({ page }) => {
    await test.step('MapCreator new map page', async () => {
      await page.goto('http://localhost:3060/new?new_mapcreator=true');
    });

    await test.step('Wait for page to load', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Click on File dropdown menu', async () => {
      await page.locator('[data-testid=\'file-dropdown\'], button:has-text(\'File\'), .file-menu').click();
    });

    await test.step('Wait for dropdown to open', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Click on Add Map option in dropdown', async () => {
      await page.locator('[data-testid=\'add-map\'], li:has-text(\'Add Map\'), button:has-text(\'Add Map\'), .menu-item:has-text(\'Add Map\')').click();
    });

    await test.step('Wait for Add Map dialog or submenu', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Click on AGV - RTP, Relay, TTP option', async () => {
      await page.locator('[data-testid=\'agv-rtp\'], button:has-text(\'AGV\'), li:has-text(\'AGV - RTP\'), .map-type-option:has-text(\'AGV\')').click();
    });

    await test.step('Verify map configuration dialog appears', async () => {
      await expect(page.locator('[data-testid=\'map-config-dialog\'], .map-configuration-modal, .create-map-form')).toBeVisible({ timeout: 1000 });
    });
  });
});
