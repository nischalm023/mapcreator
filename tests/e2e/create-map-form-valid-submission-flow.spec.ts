import { test, expect } from '../../src/fixtures/base';

test.describe('E2E: Create Map Form - Valid Submission Flow', () => {
  test('Create Map Form - Valid Submission Flow @critical', async ({ page }) => {
    await test.step('Navigate to create map page', async () => {
      await page.goto('/new');
    });

    await test.step('Map name input field', async () => {
      await page.locator('input[name=\'name\'], input[placeholder*=\'name\'], #name, [data-testid=\'map-name-input\']').fill('Test Map E2E');
    });

    await test.step('MSU dimension input field', async () => {
      await page.locator('input[name=\'msuDimension\'], input[placeholder*=\'MSU\'], #msuDimension, [data-testid=\'msu-dimension-input\']').fill('100');
    });

    await test.step('Row start input field', async () => {
      await page.locator('input[name=\'rowStart\'], input[placeholder*=\'row\'], #rowStart, [data-testid=\'row-start-input\']').fill('1');
    });

    await test.step('Row end input field', async () => {
      await page.locator('input[name=\'rowEnd\'], #rowEnd, [data-testid=\'row-end-input\']').fill('10');
    });

    await test.step('Column start input field', async () => {
      await page.locator('input[name=\'colStart\'], input[placeholder*=\'col\'], #colStart, [data-testid=\'col-start-input\']').fill('1');
    });

    await test.step('Column end input field', async () => {
      await page.locator('input[name=\'colEnd\'], #colEnd, [data-testid=\'col-end-input\']').fill('10');
    });

    await test.step('Submit the form', async () => {
      await page.locator('button[type=\'submit\'], button:has-text(\'Create\'), button:has-text(\'Submit\')').click();
    });

    await test.step('Wait for redirect to map view page', async () => {
      await page.waitForTimeout(1000);
    });
  });
});
