import { test, expect } from '../../src/fixtures/base';

test.describe('Functional: Verify AGV Map Type Options After Add Map Selection', () => {
  test('Verify AGV Map Type Options After Add Map Selection @smoke', async ({ page }) => {
    await test.step('MapCreator application', async () => {
      await page.goto('http://localhost:3060/new?new_mapcreator=true');
    });

    await test.step('Page load wait', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('File dropdown', async () => {
      await page.locator('button:has-text(\'File\')').click();
    });

    await test.step('Add Map option', async () => {
      await page.locator('li:has-text(\'Add Map\'), .dropdown-item:has-text(\'Add Map\')').click();
    });

    await test.step('Map type submenu appears', async () => {
      await expect(page.locator('.map-type-menu, .submenu, ul.map-types')).toBeVisible({ timeout: 1000 });
    });

    await test.step('AGV - RTP, Relay, TTP option is available', async () => {
      await expect(page.locator('li:has-text(\'AGV - RTP, Relay, TTP\'), .map-type-option:has-text(\'AGV\')')).toBeVisible({ timeout: 1000 });
    });

    await test.step('Capture map type options', async () => {
      await page.screenshot();
    });
  });
});
