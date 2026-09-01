import { test, expect } from '../../src/fixtures/base';

test.describe('Functional: Verify File Dropdown Menu Options', () => {
  test('Verify File Dropdown Menu Options @regression', async ({ page }) => {
    await test.step('MapCreator new map page', async () => {
      await page.goto('http://localhost:3060/new?new_mapcreator=true');
    });

    await test.step('Wait for page to load', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Click File dropdown', async () => {
      await page.locator('button:has-text(\'File\'), [data-testid=\'file-dropdown\']').click();
    });

    await test.step('Wait for dropdown to open', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Verify Add Map option is visible', async () => {
      await expect(page.locator('li:has-text(\'Add Map\'), [data-testid=\'add-map\']')).toBeVisible({ timeout: 1000 });
    });

    await test.step('Verify Edit Map option is visible', async () => {
      await expect(page.locator('li:has-text(\'Edit Map\'), [data-testid=\'edit-map\']')).toBeVisible({ timeout: 1000 });
    });

    await test.step('Capture screenshot of File dropdown menu', async () => {
      await page.screenshot();
    });
  });
});
