import { expect } from "@playwright/test";
import BasePage from "./BasePage";

/**
 * Home page object representing the main landing page
 * Note: Unauthenticated users are redirected to login page
 */
export default class HomePage extends BasePage {
  // Locators for login page (where users are redirected)
  private readonly heading = "h1";
  private readonly loginForm = "form";
  private readonly emailInput = "#email";

  /**
   * Navigate to the home page
   */
  async goto(): Promise<void> {
    await this.navigate("/");
  }

  /**
   * Verify that the homepage loaded correctly
   * (which redirects to login for unauthenticated users)
   */
  async verifyPageLoaded(): Promise<void> {
    // Verify the heading is visible (on login page)
    const headingLocator = this.getLocator(this.heading);
    await expect(headingLocator).toBeVisible();

    // Verify the page title (login page title)
    await this.verifyTitle("Logowanie - 10x Cards");

    // Verify login form is present
    const formLocator = this.getLocator(this.loginForm);
    await expect(formLocator).toBeVisible();
  }
}
