import { expect, Locator, Page } from '@playwright/test';
import { routes } from '../constants';
import { BasePage } from './base.page';

export class ForgotPasswordPage extends BasePage {
  readonly heading: Locator;
  readonly emailPlaceholder: Locator;
  readonly confirmButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByText('Enter Registered Email', { exact: true });
    this.emailPlaceholder = page.getByText('Enter Registered Email Address', { exact: true });
    this.confirmButton = page.getByRole('button', { name: 'Confirm' });
  }

  async expectLoaded(): Promise<void> {
    await this.page.waitForURL(`**${routes.forgotPassword}`, {
      timeout: 20_000,
      waitUntil: 'commit',
    });
    await expect(this.page, 'Forgot Password route should be active').toHaveURL(
      new RegExp(`${routes.forgotPassword}$`)
    );
    await this.prepareFlutter();
    await expect(this.heading, 'Forgot Password heading should be displayed').toBeAttached({
      timeout: 15_000,
    });
    await expect(
      this.emailPlaceholder,
      'Registered email placeholder should be displayed'
    ).toBeAttached();
    await expect(this.confirmButton, 'Confirm button should be available').toBeAttached();
    await expect(
      this.page.getByRole('button', { name: 'Log In' }),
      'Login page Log In button should not remain after navigation'
    ).toHaveCount(0);
  }
}
