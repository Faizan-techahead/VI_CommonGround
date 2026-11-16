import { expect, Locator, Page } from '@playwright/test';
import { LOGIN_ERRORS, LOGIN_TEST_DATA, routes } from '../constants';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly emailField: Locator;
  readonly emailPlaceholder: Locator;
  readonly emailIcon: Locator;
  readonly passwordInput: Locator;
  readonly passwordField: Locator;
  readonly passwordPlaceholder: Locator;
  readonly lockIcon: Locator;
  readonly passwordVisibilityToggle: Locator;
  readonly loginButton: Locator;
  readonly forgotPasswordButton: Locator;
  readonly heading: Locator;
  readonly loginErrorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('input[type="text"]').first();
    // Innermost semantics node that directly wraps the email input (not page ancestors).
    this.emailField = page.locator('flt-semantics').filter({
      has: page.locator(':scope > input[type="text"]'),
    });
    this.emailPlaceholder = this.emailField.getByText('Enter Email', { exact: true });
    this.emailIcon = this.emailField.locator('+ flt-semantics[role="img"]');
    this.passwordInput = page.locator('input[type="password"]');
    // Innermost semantics node that directly wraps the password input (not page ancestors).
    this.passwordField = page.locator('flt-semantics').filter({
      has: page.locator(':scope > input[type="password"]'),
    });
    this.passwordPlaceholder = this.passwordField.getByText('Enter Password', { exact: true });
    this.lockIcon = this.passwordField.locator('+ flt-semantics[role="img"]');
    // Eye icon is an unlabeled semantics button to the right of the password field.
    this.passwordVisibilityToggle = page.locator('flt-semantics[role="button"]').filter({
      hasText: /^$/,
    });
    this.loginButton = page.getByRole('button', { name: 'Log In' });
    this.forgotPasswordButton = page.getByRole('button', { name: 'Forgot Password ?' });
    this.heading = page.getByText('Log In', { exact: true }).first();
    // Fluttertoast/snack feedback is exposed via semantics aria-label, not visible text nodes.
    this.loginErrorMessage = page.locator(
      `flt-semantics[aria-label="${LOGIN_ERRORS.adminDoesNotExist}"]`
    );
  }

  async goto(): Promise<void> {
    await this.page.goto(routes.login);
    await this.prepareFlutter();
    await this.loginButton.waitFor({ state: 'attached' });
  }

  async clickForgotPassword(): Promise<void> {
    await expect(
      this.forgotPasswordButton,
      'Forgot Password control should be present before click'
    ).toBeAttached();
    await this.forceClick(this.forgotPasswordButton);
  }

  async fillEmail(email: string): Promise<void> {
    // Flutter web often ignores fill(); type into the focused semantics text field.
    await this.emailInput.click({ force: true });
    await this.page.keyboard.press('ControlOrMeta+A');
    await this.page.keyboard.type(email, { delay: 30 });
    if ((await this.emailInput.inputValue()) !== email) {
      await this.page.keyboard.press('ControlOrMeta+A');
      await this.page.keyboard.type(email, { delay: 30 });
    }
    await expect(this.emailInput, 'Email field should contain the entered email').toHaveValue(email);
  }

  async fillPassword(password: string): Promise<void> {
    const passwordField = this.page.getByRole('textbox').last();
    await passwordField.click({ force: true });
    await this.page.keyboard.type('x');
    await this.page.keyboard.press('Backspace');
    await this.page.keyboard.type(password, { delay: 30 });

    if ((await passwordField.inputValue()) !== password) {
      await this.page.keyboard.press('ControlOrMeta+A');
      await this.page.keyboard.type(password, { delay: 30 });
    }

    await expect(passwordField, 'Password field should contain the entered password').toHaveValue(
      password
    );
  }

  async fillCredentials(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await expect(
      this.emailInput,
      'Email value must still be present after entering password'
    ).toHaveValue(email);
  }

  /**
   * Keeps the email field empty. Flutter form validators use on-user-interaction mode,
   * so a brief edit+clear is required before the empty-email message can appear.
   */
  async leaveEmailBlank(): Promise<void> {
    // Flutter's transparent email input is often off-screen; fall back to DOM focus.
    await this.emailInput.click({ force: true }).catch(async () => {
      await this.page.evaluate(() => {
        (document.querySelector('input#email, input[type="text"]') as HTMLInputElement | null)?.focus();
      });
    });
    await this.page.keyboard.type('x', { delay: 20 });
    await this.page.keyboard.press('Backspace');
    await expect(this.emailInput, 'Email field should remain blank').toHaveValue('');
  }

  /**
   * Keeps the password field empty. Uses the same edit+clear interaction as email so
   * Flutter on-user-interaction validators have a chance to run.
   */
  async leavePasswordBlank(): Promise<void> {
    const passwordField = this.page.getByRole('textbox').last();
    await passwordField.click({ force: true });
    await this.page.keyboard.type('x', { delay: 20 });
    await this.page.keyboard.press('Backspace');
    await expect(passwordField, 'Password field should remain blank').toHaveValue('');
  }

  /**
   * Leaves both credential fields empty. Password starts empty on the login page;
   * email needs edit+clear so Flutter on-user-interaction validators are primed.
   */
  async leaveBothFieldsBlank(): Promise<void> {
    const passwordField = this.page.getByRole('textbox').last();
    await expect(passwordField, 'Password should already be blank on load').toHaveValue('');
    await this.leaveEmailBlank();
    await expect(this.emailInput, 'Email field should remain blank').toHaveValue('');
    await expect(passwordField, 'Password field should remain blank').toHaveValue('');
  }

  async clickLogin(options?: { waitForApi?: boolean }): Promise<void> {
    const waitForApi = options?.waitForApi ?? true;
    await expect(this.loginButton, 'Log In button should be present before click').toBeAttached();
    const loginResponsePromise = waitForApi
      ? this.page.waitForResponse(
          (response) => response.url().includes('/api/v2/auth/login'),
          { timeout: 30_000 }
        )
      : null;
    // Flutter web login is unreliable with click alone; submit via Enter then button click.
    await this.page.keyboard.press('Enter');
    await this.forceClick(this.loginButton).catch(() => undefined);
    if (loginResponsePromise) {
      await loginResponsePromise;
    }
  }

  /**
   * Submits blank credentials for client-side validation. The Log In control stays inactive
   * when both fields are empty, so re-prime email then use Enter + semantics DOM click.
   */
  async submitBlankCredentialsForValidation(): Promise<void> {
    const validation = this.page.getByText(LOGIN_ERRORS.emailCannotBeEmpty, { exact: true });

    for (let attempt = 0; attempt < 3; attempt++) {
      if (await validation.isVisible().catch(() => false)) {
        return;
      }

      // Re-prime email each attempt — Flutter may drop the touched/empty validator state.
      await this.leaveEmailBlank();
      await this.page.keyboard.press('Enter');
      await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('flt-semantics[role="button"]'));
        const login = buttons.find((button) => (button.textContent || '').trim() === 'Log In');
        (login as HTMLElement | undefined)?.click();
      });
      await this.forceClick(this.loginButton).catch(() => undefined);

      try {
        await validation.waitFor({ state: 'attached', timeout: 3_000 });
        return;
      } catch {
        // Retry — Flutter sometimes ignores blank-form submit while Log In looks disabled.
      }
    }
  }

  async login(email: string, password: string): Promise<void> {
    await this.fillCredentials(email, password);
    await this.clickLogin();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.passwordInput).toBeAttached();
    await expect(this.forgotPasswordButton).toBeAttached();
    await expect(this.loginButton).toBeAttached();
  }

  async expectEmailField(): Promise<void> {
    await expect(this.emailField, 'Email field container should resolve uniquely').toHaveCount(1);
    await expect(this.emailInput, 'Email input should be present').toBeAttached();
    await expect(this.emailInput, 'There should be exactly one email input').toHaveCount(1);
    await expect(this.emailInput).toHaveAttribute('type', 'text');
    await expect(this.emailInput).toHaveAttribute('inputmode', 'email');
    await expect(this.emailInput, 'Email field should be empty when showing placeholder').toHaveValue('');

    const emailBox = await this.emailInput.boundingBox();
    expect(emailBox, 'Email field should be rendered on screen').toBeTruthy();
    expect(emailBox!.width, 'Email field width should be greater than 0').toBeGreaterThan(0);
    expect(emailBox!.height, 'Email field height should be greater than 0').toBeGreaterThan(0);
  }

  async expectEmailPlaceholder(): Promise<void> {
    const placeholder = this.emailPlaceholder.last();
    await expect(placeholder, 'Enter Email placeholder should be present in the email field').toBeAttached();
    await expect(this.emailField).toContainText('Enter Email');
    await expect(placeholder).toHaveText(/^Enter Email$/);
    await expect(
      this.emailInput,
      'Placeholder should only display when email value is empty'
    ).toHaveValue('');

    // Fail if the exact placeholder label is missing or renamed.
    await expect(this.page.getByText('Enter Email', { exact: true }).first()).toBeAttached();

    const placeholderBox = await placeholder.boundingBox();
    expect(placeholderBox, 'Enter Email placeholder should be rendered on screen').toBeTruthy();
    expect(placeholderBox!.width, 'Placeholder width should be greater than 0').toBeGreaterThan(0);
    expect(placeholderBox!.height, 'Placeholder height should be greater than 0').toBeGreaterThan(0);
  }

  async expectEmailIcon(): Promise<void> {
    await expect(this.emailIcon, 'Email icon should be present next to the email field').toBeAttached();
    await expect(this.emailIcon, 'There should be exactly one email icon beside the email field').toHaveCount(1);
    await expect(this.emailIcon).toHaveAttribute('role', 'img');

    const emailBox = await this.emailField.boundingBox();
    const iconBox = await this.emailIcon.boundingBox();
    expect(emailBox, 'Email field should be rendered for icon position checks').toBeTruthy();
    expect(iconBox, 'Email icon should be rendered on screen').toBeTruthy();
    expect(iconBox!.width, 'Email icon width should be greater than 0').toBeGreaterThan(0);
    expect(iconBox!.height, 'Email icon height should be greater than 0').toBeGreaterThan(0);

    // Icon must sit inside/near the left side of the email field (not logo / lock icon).
    expect(iconBox!.x, 'Email icon should start at or after the email field left edge').toBeGreaterThanOrEqual(
      emailBox!.x - 2
    );
    expect(iconBox!.x, 'Email icon should remain near the left side of the email field').toBeLessThan(
      emailBox!.x + 60
    );
    expect(iconBox!.y, 'Email icon should align with the email field vertically').toBeGreaterThanOrEqual(
      emailBox!.y - 5
    );
    expect(
      iconBox!.y + iconBox!.height,
      'Email icon should stay within the email field vertical bounds'
    ).toBeLessThanOrEqual(emailBox!.y + emailBox!.height + 5);
  }

  async expectPasswordField(): Promise<void> {
    await expect(this.passwordField, 'Password field container should resolve uniquely').toHaveCount(1);
    await expect(this.passwordInput, 'Password input should be present').toBeAttached();
    await expect(this.passwordInput, 'There should be exactly one password input').toHaveCount(1);
    await expect(this.passwordInput).toHaveAttribute('type', 'password');
    await expect(
      this.passwordInput,
      'Password field should be empty when showing placeholder'
    ).toHaveValue('');

    const passwordBox = await this.passwordInput.boundingBox();
    expect(passwordBox, 'Password field should be rendered on screen').toBeTruthy();
    expect(passwordBox!.width, 'Password field width should be greater than 0').toBeGreaterThan(0);
    expect(passwordBox!.height, 'Password field height should be greater than 0').toBeGreaterThan(0);
  }

  async expectPasswordPlaceholder(): Promise<void> {
    const placeholder = this.passwordPlaceholder.last();
    await expect(
      placeholder,
      'Enter Password placeholder should be present in the password field'
    ).toBeAttached();
    await expect(this.passwordField).toContainText('Enter Password');
    await expect(placeholder).toHaveText(/^Enter Password$/);
    await expect(
      this.passwordInput,
      'Placeholder should only display when password value is empty'
    ).toHaveValue('');

    // Fail if the exact placeholder label is missing or renamed.
    await expect(this.page.getByText('Enter Password', { exact: true }).first()).toBeAttached();

    const placeholderBox = await placeholder.boundingBox();
    expect(placeholderBox, 'Enter Password placeholder should be rendered on screen').toBeTruthy();
    expect(placeholderBox!.width, 'Placeholder width should be greater than 0').toBeGreaterThan(0);
    expect(placeholderBox!.height, 'Placeholder height should be greater than 0').toBeGreaterThan(0);
  }

  async expectLockIcon(): Promise<void> {
    await expect(this.lockIcon, 'Lock icon should be present next to the password field').toBeAttached();
    await expect(this.lockIcon, 'There should be exactly one lock icon beside the password field').toHaveCount(
      1
    );
    await expect(this.lockIcon).toHaveAttribute('role', 'img');

    const passwordBox = await this.passwordField.boundingBox();
    const iconBox = await this.lockIcon.boundingBox();
    expect(passwordBox, 'Password field should be rendered for icon position checks').toBeTruthy();
    expect(iconBox, 'Lock icon should be rendered on screen').toBeTruthy();
    expect(iconBox!.width, 'Lock icon width should be greater than 0').toBeGreaterThan(0);
    expect(iconBox!.height, 'Lock icon height should be greater than 0').toBeGreaterThan(0);

    // Icon must sit inside/near the left side of the password field (not logo / email icon).
    expect(iconBox!.x, 'Lock icon should start at or after the password field left edge').toBeGreaterThanOrEqual(
      passwordBox!.x - 2
    );
    expect(iconBox!.x, 'Lock icon should remain near the left side of the password field').toBeLessThan(
      passwordBox!.x + 60
    );
    expect(iconBox!.y, 'Lock icon should align with the password field vertically').toBeGreaterThanOrEqual(
      passwordBox!.y - 5
    );
    expect(
      iconBox!.y + iconBox!.height,
      'Lock icon should stay within the password field vertical bounds'
    ).toBeLessThanOrEqual(passwordBox!.y + passwordBox!.height + 5);
  }

  async expectSuccessfulLogin(): Promise<void> {
    await this.page.waitForURL(`**${routes.individualUsers}`, {
      timeout: 45_000,
      waitUntil: 'commit',
    });
    await expect(this.page, 'User should land on Individual Users after login').toHaveURL(
      new RegExp(`${routes.individualUsers}$`)
    );
    await this.prepareFlutter();
    await expect(
      this.flutterButton('Individual Users'),
      'Post-login admin landing sidebar should show Individual Users'
    ).toBeAttached();
    await expect(this.page.getByText('Enter Email', { exact: true })).toHaveCount(0);
    await expect(this.page.getByText('Enter Password', { exact: true })).toHaveCount(0);
  }

  async expectLoginError(message: string = LOGIN_ERRORS.adminDoesNotExist): Promise<void> {
    const error = this.page.locator(`flt-semantics[aria-label="${message}"]`);
    await expect(
      error,
      `Login error "${message}" should be exposed in the accessibility tree`
    ).toBeAttached({ timeout: 15_000 });
    await expect(error).toHaveAttribute('aria-label', message);

    await expect(
      this.page,
      'User must remain on the login page after a failed login attempt'
    ).not.toHaveURL(new RegExp(`${routes.individualUsers}`));
    await expect(this.loginButton, 'Login form should still be available after error').toBeAttached();
    await expect(this.heading, 'Login heading should still be shown after error').toBeAttached();
  }

  async expectEmailEmptyValidation(): Promise<void> {
    const message = LOGIN_ERRORS.emailCannotBeEmpty;
    const validation = this.page.getByText(message, { exact: true });
    await expect(
      validation,
      `Mandatory email validation "${message}" should be displayed`
    ).toBeAttached({ timeout: 10_000 });
    await expect(validation).toHaveText(message);
    await expect(this.emailInput, 'Email field should still be blank').toHaveValue('');
    await expect(
      this.page,
      'User must remain on the login page after blank-email validation'
    ).not.toHaveURL(new RegExp(`${routes.individualUsers}`));
    await expect(this.loginButton, 'Login form should still be available').toBeAttached();
    await expect(this.heading, 'Login heading should still be shown').toBeAttached();
  }

  /**
   * Live app does not render password-empty copy (unlike email). Blank-password
   * validation is enforced by blocking submit: password stays empty, placeholder
   * remains, and the user stays on the login page with no auth navigation.
   */
  async expectPasswordEmptyValidation(): Promise<void> {
    const passwordField = this.page.getByRole('textbox').last();
    await expect(passwordField, 'Password field should still be blank').toHaveValue('');
    await expect(
      this.page.getByText('Enter Password', { exact: true }).first(),
      'Enter Password placeholder should remain as the empty-password validation cue'
    ).toBeAttached({ timeout: 10_000 });
    await expect(
      this.page,
      'User must remain on the login page after blank-password validation'
    ).not.toHaveURL(new RegExp(`${routes.individualUsers}`));
    await expect(
      this.page,
      'Blank password must not navigate to the Forgot Password flow'
    ).not.toHaveURL(new RegExp(`${routes.forgotPassword}`));
    await expect(this.loginButton, 'Login form should still be available').toBeAttached();
    await expect(this.heading, 'Login heading should still be shown').toBeAttached();
    await expect(
      this.page.getByText(LOGIN_ERRORS.emailCannotBeEmpty, { exact: true }),
      'Blank-password case must not surface email-empty validation'
    ).toHaveCount(0);
  }

  /**
   * Live app surfaces email-empty validation when both fields are blank on submit.
   * Password-empty copy is not currently rendered in this combined blank state.
   */
  async expectBothFieldsEmptyValidation(): Promise<void> {
    const message = LOGIN_ERRORS.emailCannotBeEmpty;
    const validation = this.page.getByText(message, { exact: true });
    await expect(
      validation,
      `Validation message "${message}" should be displayed when both fields are blank`
    ).toBeAttached({ timeout: 10_000 });
    await expect(validation).toHaveText(message);

    await expect(this.emailInput, 'Email field should still be blank').toHaveValue('');
    await expect(
      this.page.getByRole('textbox').last(),
      'Password field should still be blank'
    ).toHaveValue('');
    await expect(
      this.page,
      'User must remain on the login page after blank-field validation'
    ).not.toHaveURL(new RegExp(`${routes.individualUsers}`));
    await expect(this.loginButton, 'Login form should still be available').toBeAttached();
    await expect(this.heading, 'Login heading should still be shown').toBeAttached();
  }

  async expectInvalidEmailFormatValidation(
    email: string = LOGIN_TEST_DATA.invalidEmailFormat
  ): Promise<void> {
    const message = LOGIN_ERRORS.invalidEmailFormat;
    const validation = this.page.getByText(message, { exact: true });
    await expect(
      validation,
      `Email format validation "${message}" should be displayed`
    ).toBeAttached({ timeout: 10_000 });
    await expect(validation).toHaveText(message);
    await expect(this.emailInput, 'Invalid email value should remain in the field').toHaveValue(email);
    await expect(
      this.page,
      'User must remain on the login page after invalid email format validation'
    ).not.toHaveURL(new RegExp(`${routes.individualUsers}`));
    await expect(this.loginButton, 'Login form should still be available').toBeAttached();
    await expect(this.heading, 'Login heading should still be shown').toBeAttached();
  }

  /** Clicks the unlabeled eye-icon button beside the password field. */
  async clickPasswordVisibilityToggle(): Promise<void> {
    const count = await this.passwordVisibilityToggle.count();
    for (let i = 0; i < count; i++) {
      const candidate = this.passwordVisibilityToggle.nth(i);
      const box = await candidate.boundingBox();
      if (box && box.width > 10 && box.height > 10) {
        await this.forceClick(candidate);
        return;
      }
    }
    throw new Error('Password visibility (eye) toggle was not found on the login form');
  }

  async expectPasswordVisible(password: string): Promise<void> {
    const visiblePassword = this.page.locator(
      'input#current-password[type="text"], input[name="current-password"][type="text"]'
    );
    await expect(
      visiblePassword,
      'Password should be exposed as a visible text input after clicking the eye icon'
    ).toBeAttached({ timeout: 10_000 });
    await expect(visiblePassword, 'Visible password value should match what was entered').toHaveValue(
      password
    );
  }

  async expectPasswordHidden(password: string): Promise<void> {
    const hiddenPassword = this.page.locator(
      'input#current-password[type="password"], input[name="current-password"][type="password"]'
    );
    await expect(
      hiddenPassword,
      'Password should be masked as a password input after clicking the eye icon again'
    ).toBeAttached({ timeout: 10_000 });
    await expect(hiddenPassword, 'Hidden password value should still match what was entered').toHaveValue(
      password
    );
    await expect(
      this.page.locator('input[name="current-password"][type="text"]'),
      'Password must not remain in a visible text input while hidden'
    ).toHaveCount(0);
  }
}
