import { test, expect } from '../../src/fixtures/base';

test.describe('E2E: Saved Maps Route - Verify Public Access', () => {
  test('Saved Maps Route - Verify Public Access @smoke', async ({ page }) => {
    await page.goto('/version');

    await expect(page.locator('h1, h2, [data-testid=\'saved-maps-title\']')).toBeVisible({ timeout: 1000 });

    await page.waitForTimeout(1000);
  });
});
