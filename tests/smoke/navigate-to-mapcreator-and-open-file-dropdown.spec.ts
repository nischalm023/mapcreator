import { test, expect } from '../../src/fixtures/base';

test.describe('Smoke: Navigate to MapCreator and Open File Dropdown', () => {
  test('Navigate to MapCreator and Open File Dropdown @critical', async ({ page }) => {
    await test.step('MapCreator new map page with new_mapcreator flag', async () => {
      await page.goto('http://localhost:3060/new?new_mapcreator=true');
    });

    await test.step('Wait for page to fully load', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('File dropdown menu button in the toolbar', async () => {
      await expect(page.locator('[data-testid=\'file-dropdown\'], button:has-text(\'File\'), .file-menu, .menu-bar button:first-child')).toBeVisible({ timeout: 1000 });
    });

    await test.step('Click on File dropdown menu', async () => {
      await page.locator('[data-testid=\'file-dropdown\'], button:has-text(\'File\'), .file-menu, .menu-bar button:first-child').click();
    });

    await test.step('Verify File dropdown menu opens and displays options', async () => {
      await expect(page.locator('[role=\'menu\'], .dropdown-menu, .file-dropdown-content')).toBeVisible({ timeout: 1000 });
    });
  });
});
