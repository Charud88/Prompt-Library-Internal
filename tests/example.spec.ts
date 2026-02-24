import { test, expect } from '@playwright/test';

test('homepage loads and shows the hero title', async ({ page }) => {
  // 1. Go to your local dev server
  await page.goto('http://localhost:3000/');

  // 2. Expect the page title to be correct
  await expect(page).toHaveTitle(/Prompt Library/i);

  // 3. Expect the main hero heading to be visible
  await expect(page.locator('h1').getByText('PROMPT LIBRARY')).toBeVisible();
});
