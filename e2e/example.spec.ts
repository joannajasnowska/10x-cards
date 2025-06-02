import { test, expect } from "@playwright/test";
import HomePage from "./page-objects/HomePage";

test.describe("Home Page", () => {
  test("should load the home page correctly", async ({ page }) => {
    // Arrange
    const homePage = new HomePage(page);

    // Act
    await homePage.goto();

    // Assert
    await homePage.verifyPageLoaded();
  });

  test("page title should be correct", async ({ page }) => {
    // Arrange
    const homePage = new HomePage(page);

    // Act
    await homePage.goto();

    // Assert
    await expect(page).toHaveTitle("10x Cards");
  });

  test("should take a screenshot that matches baseline", async ({ page }) => {
    // Arrange
    const homePage = new HomePage(page);

    // Act
    await homePage.goto();
    await homePage.waitForNavigation();

    // Assert - visual comparison
    await expect(page).toHaveScreenshot("home-page.png");
  });
});
