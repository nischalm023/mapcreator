import { test, expect } from '../../src/fixtures/base';

test.describe('Negative / Edge Case: Negative Test - Create Map Without Required Fields', () => {
  test('Negative Test - Create Map Without Required Fields @regression', async ({ page }) => {
    await test.step('MapCreator application', async () => {
      await page.goto('http://localhost:3060/new?new_mapcreator=true');
    });

    await test.step('Page load', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('File menu', async () => {
      await page.locator('button:has-text(\'File\')').click();
    });

    await test.step('Add Map', async () => {
      await page.locator('li:has-text(\'Add Map\')').click();
    });

    await test.step('AGV type', async () => {
      await page.locator('li:has-text(\'AGV - RTP\')').click();
    });

    await test.step('Form wait', async () => {
      await page.waitForTimeout(1000);
    });

    await test.step('Click Create without filling fields', async () => {
      await page.locator('button:has-text(\'Create\'), button[type=\'submit\']').click();
    });

    await test.step('Validation error message appears', async () => {
      await expect(page.locator('.error-message, .validation-error, .field-error, [data-testid=\'error\']')).toBeVisible({ timeout: 1000 });
    });
  });
});
