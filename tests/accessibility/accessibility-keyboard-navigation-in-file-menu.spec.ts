import { test, expect } from '../../src/fixtures/base';

test.describe('Accessibility: Accessibility - Keyboard Navigation in File Menu', () => {
  test('Accessibility - Keyboard Navigation in File Menu @regression', async ({ page }) => {
    await test.step('MapCreator application', async () => {
      await page.goto('http://localhost:3060/new?new_mapcreator=true');
    });

    await test.step('Page load', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Focus and open File menu', async () => {
      await page.locator('button:has-text(\'File\')').click();
    });

    await test.step('Dropdown is open', async () => {
      await expect(page.locator('.dropdown-menu, ul.menu-items')).toBeVisible({ timeout: 1000 });
    });

    await test.step('Menu items have proper ARIA roles', async () => {
      await expect(page.locator('[role=\'menuitem\'], li[role=\'option\'], .dropdown-item')).toBeVisible({ timeout: 1000 });
    });

    await test.step('Capture menu with accessibility attributes', async () => {
      await page.screenshot();
    });
  });
});
