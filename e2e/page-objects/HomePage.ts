import { Page, expect } from "@playwright/test";
import BasePage from "./BasePage";

/**
 * Home page object representing the main landing page
 */
export default class HomePage extends BasePage {
  // Locators
  private readonly heading = "h1";

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to the home page
   */
  async goto(): Promise<void> {
    await this.navigate("/");
  }

  /**
   * Verify that the homepage loaded correctly
   */
  async verifyPageLoaded(): Promise<void> {
    // Verify the heading is visible
    const headingLocator = this.getLocator(this.heading);
    await expect(headingLocator).toBeVisible();

    // Verify the page title
    await this.verifyTitle("10x Cards");
  }
}
