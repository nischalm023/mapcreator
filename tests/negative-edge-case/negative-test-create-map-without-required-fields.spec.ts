import { test, expect } from '../../src/fixtures/base';

test.describe('Negative / Edge Case: Negative Test - Create Map Without Required Fields', () => {
  test('Negative Test - Create Map Without Required Fields @smoke', async ({ page }) => {
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

    await test.step('Click Create without filling fields', async () => {
      await page.locator('button:has-text(\'Create\')').click();
    });

    await test.step('Verify validation error is displayed for missing required fields', async () => {
      await expect(page.locator('.error-message, .validation-error, [role=\'alert\'], .field-error')).toBeVisible({ timeout: 1000 });
    });
  });
});
