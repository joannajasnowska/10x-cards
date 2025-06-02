import { test, expect } from "@playwright/test";

test.describe("Basic functionality test", () => {
  test("simple Playwright test", async ({ page }) => {
    // Navigate to a public website that's always available
    await page.goto("https://playwright.dev/");

    // Verify the title
    const title = await page.title();
    expect(title).toContain("Playwright");

    // Find an element and verify text using a more reliable selector
    const headingText = await page.locator("h1").first().textContent();
    expect(headingText).toBeTruthy();
    console.log("Found heading text:", headingText);
  });
});
