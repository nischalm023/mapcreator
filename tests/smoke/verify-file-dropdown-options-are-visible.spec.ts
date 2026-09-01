import { test, expect } from '../../src/fixtures/base';

test.describe('Smoke: Verify File Dropdown Options Are Visible', () => {
  test('Verify File Dropdown Options Are Visible @smoke', async ({ page }) => {
    await test.step('MapCreator application', async () => {
      await page.goto('http://localhost:3060/new?new_mapcreator=true');
    });

    await test.step('Wait for application to load', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('File dropdown button is visible', async () => {
      await expect(page.locator('button:has-text(\'File\'), .file-menu, [data-testid=\'file-dropdown\']')).toBeVisible({ timeout: 1000 });
    });

    await test.step('Click File dropdown', async () => {
      await page.locator('button:has-text(\'File\'), .file-menu, [data-testid=\'file-dropdown\']').click();
    });

    await test.step('Dropdown menu opens', async () => {
      await expect(page.locator('.dropdown-menu, .file-dropdown-menu, ul.menu-items')).toBeVisible({ timeout: 1000 });
    });

    await test.step('Add Map option is visible', async () => {
      await expect(page.locator('li:has-text(\'Add Map\'), .dropdown-item:has-text(\'Add Map\')')).toBeVisible({ timeout: 1000 });
    });

    await test.step('Capture File dropdown menu', async () => {
      await page.screenshot();
    });
  });
});
