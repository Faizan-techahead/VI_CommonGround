import { LOGIN_ERRORS, LOGIN_TEST_DATA } from '../../src/constants';
import { AuthUtils } from '../../src/utils/auth.utils';
import { expect, test } from '../fixtures/test';

test.describe('Login', { tag: '@regression' }, () => {
  test('shows the login form on a desktop viewport', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.expectLoaded();
  });

  test(
    'Verify Email field placeholder and icon',
    { tag: ['@regression', '@positive', '@ui'] },
    async ({ loginPage, screenshotStep }) => {
      await screenshotStep('Open the Admin Login page', async () => {
        await loginPage.goto();
        await loginPage.expectLoaded();
        await expect(loginPage.heading).toBeAttached();
      });

      await screenshotStep('Observe the Email field', async () => {
        await loginPage.expectEmailField();
      });

      await screenshotStep('Confirm the Enter Email placeholder is displayed', async () => {
        await loginPage.expectEmailPlaceholder();
      });

      await screenshotStep('Confirm the email icon is displayed', async () => {
        await loginPage.expectEmailIcon();
      });
    }
  );

  test(
    'Verify Password field placeholder and icon',
    { tag: ['@regression', '@positive', '@ui'] },
    async ({ loginPage, screenshotStep }) => {
      await screenshotStep('Open the Admin Login page', async () => {
        await loginPage.goto();
        await loginPage.expectLoaded();
        await expect(loginPage.heading).toBeAttached();
      });

      await screenshotStep('Observe the Password field', async () => {
        await loginPage.expectPasswordField();
      });

      await screenshotStep('Confirm the Enter Password placeholder is displayed', async () => {
        await loginPage.expectPasswordPlaceholder();
      });

      await screenshotStep('Confirm the lock icon is displayed', async () => {
        await loginPage.expectLockIcon();
      });
    }
  );

  test(
    'Verify successful login with valid credentials',
    { tag: ['@regression', '@positive', '@functional'] },
    async ({ loginPage, individualUsersPage, screenshotStep }) => {
      test.setTimeout(90_000);

      await screenshotStep('Open the Admin Login page', async () => {
        await loginPage.goto();
        await loginPage.expectLoaded();
        await expect(loginPage.heading).toBeAttached();
      });

      await screenshotStep('Enter valid admin email and password', async () => {
        const { email, password } = AuthUtils.adminCredentials();
        await loginPage.fillCredentials(email, password);
      });

      await screenshotStep('Click Login', async () => {
        await loginPage.clickLogin();
      });

      await screenshotStep(
        'Confirm the user is redirected to the post-login admin landing page',
        async () => {
          await loginPage.expectSuccessfulLogin();
          await individualUsersPage.expectLoaded();
          await expect(
            individualUsersPage.loggedInEmail,
            'Logged-in admin email should be visible on the landing page'
          ).toBeAttached();
        }
      );
    }
  );

  test(
    'Verify login with invalid email',
    { tag: ['@regression', '@negative', '@functional'] },
    async ({ loginPage, screenshotStep }) => {
      test.setTimeout(60_000);

      await screenshotStep('Open the Admin Login page', async () => {
        await loginPage.goto();
        await loginPage.expectLoaded();
        await expect(loginPage.heading).toBeAttached();
      });

      await screenshotStep('Enter email invalid@test.com', async () => {
        await loginPage.fillEmail(LOGIN_TEST_DATA.invalidEmail);
      });

      await screenshotStep('Enter a valid password', async () => {
        const { password } = AuthUtils.adminCredentials();
        await loginPage.fillPassword(password);
        await expect(loginPage.emailInput).toHaveValue(LOGIN_TEST_DATA.invalidEmail);
      });

      await screenshotStep('Click Login', async () => {
        await loginPage.clickLogin();
      });

      await screenshotStep('Confirm an error message is displayed', async () => {
        await loginPage.expectLoginError();
      });
    }
  );

  test(
    'Verify login with incorrect password',
    { tag: ['@regression', '@negative', '@functional'] },
    async ({ loginPage, screenshotStep }) => {
      test.setTimeout(60_000);

      await screenshotStep('Open the Admin Login page', async () => {
        await loginPage.goto();
        await loginPage.expectLoaded();
        await expect(loginPage.heading).toBeAttached();
      });

      await screenshotStep('Enter a valid admin email', async () => {
        const { email } = AuthUtils.adminCredentials();
        await loginPage.fillEmail(email);
      });

      await screenshotStep('Enter an incorrect password', async () => {
        const { email } = AuthUtils.adminCredentials();
        await loginPage.fillPassword(LOGIN_TEST_DATA.incorrectPassword);
        await expect(loginPage.emailInput).toHaveValue(email);
      });

      await screenshotStep('Click Login', async () => {
        await loginPage.clickLogin();
      });

      await screenshotStep('Confirm an error message is displayed', async () => {
        await loginPage.expectLoginError(LOGIN_ERRORS.invalidCredentials);
      });
    }
  );

  test(
    'Verify blank Email field validation',
    { tag: ['@regression', '@negative', '@validation'] },
    async ({ loginPage, screenshotStep }) => {
      test.setTimeout(60_000);

      await screenshotStep('Open the Admin Login page', async () => {
        await loginPage.goto();
        await loginPage.expectLoaded();
        await expect(loginPage.heading).toBeAttached();
      });

      await screenshotStep('Leave the Email field blank', async () => {
        await loginPage.leaveEmailBlank();
      });

      await screenshotStep('Enter a password', async () => {
        await loginPage.fillPassword(LOGIN_TEST_DATA.incorrectPassword);
        await expect(loginPage.emailInput).toHaveValue('');
      });

      await screenshotStep('Click Login', async () => {
        await loginPage.clickLogin({ waitForApi: false });
      });

      await screenshotStep('Confirm mandatory Email validation is displayed', async () => {
        await loginPage.expectEmailEmptyValidation();
      });
    }
  );

  test(
    'Verify blank Password field validation',
    { tag: ['@regression', '@negative', '@validation'] },
    async ({ loginPage, screenshotStep }) => {
      test.setTimeout(60_000);

      await screenshotStep('Open the Admin Login page', async () => {
        await loginPage.goto();
        await loginPage.expectLoaded();
        await expect(loginPage.heading).toBeAttached();
      });

      await screenshotStep('Enter a valid email', async () => {
        const { email } = AuthUtils.adminCredentials();
        await loginPage.fillEmail(email);
      });

      await screenshotStep('Leave the Password field blank', async () => {
        await loginPage.leavePasswordBlank();
      });

      await screenshotStep('Click Login', async () => {
        await loginPage.clickLogin({ waitForApi: false });
      });

      await screenshotStep('Confirm mandatory Password validation is displayed', async () => {
        // App blocks submit without password-empty text; assert the live validation UX.
        await loginPage.expectPasswordEmptyValidation();
      });
    }
  );

  test(
    'Verify both fields blank',
    { tag: ['@regression', '@negative', '@validation'] },
    async ({ loginPage, screenshotStep }) => {
      test.setTimeout(60_000);

      await screenshotStep('Open the Admin Login page', async () => {
        await loginPage.goto();
        await loginPage.expectLoaded();
        await expect(loginPage.heading).toBeAttached();
      });

      await screenshotStep('Leave Email and Password blank', async () => {
        await loginPage.leaveBothFieldsBlank();
      });

      await screenshotStep('Click Login', async () => {
        await loginPage.submitBlankCredentialsForValidation();
      });

      await screenshotStep('Confirm validation messages are displayed', async () => {
        await loginPage.expectBothFieldsEmptyValidation();
      });
    }
  );

  test(
    'Verify invalid email format',
    { tag: ['@regression', '@negative', '@validation'] },
    async ({ loginPage, screenshotStep }) => {
      test.setTimeout(60_000);

      await screenshotStep('Open the Admin Login page', async () => {
        await loginPage.goto();
        await loginPage.expectLoaded();
        await expect(loginPage.heading).toBeAttached();
      });

      await screenshotStep('Enter email format admin.com', async () => {
        await loginPage.fillEmail(LOGIN_TEST_DATA.invalidEmailFormat);
      });

      await screenshotStep('Enter a password', async () => {
        await loginPage.fillPassword(LOGIN_TEST_DATA.incorrectPassword);
        await expect(loginPage.emailInput).toHaveValue(LOGIN_TEST_DATA.invalidEmailFormat);
      });

      await screenshotStep('Click Login', async () => {
        await loginPage.clickLogin({ waitForApi: false });
      });

      await screenshotStep('Confirm email format validation is displayed', async () => {
        await loginPage.expectInvalidEmailFormatValidation();
      });
    }
  );

  test(
    'Verify password show/hide functionality',
    { tag: ['@regression', '@positive', '@functional'] },
    async ({ loginPage, screenshotStep }) => {
      test.setTimeout(60_000);
      const password = LOGIN_TEST_DATA.incorrectPassword;

      await screenshotStep('Open the Admin Login page', async () => {
        await loginPage.goto();
        await loginPage.expectLoaded();
        await expect(loginPage.heading).toBeAttached();
      });

      await screenshotStep('Enter a password', async () => {
        await loginPage.fillPassword(password);
      });

      await screenshotStep('Click the eye icon', async () => {
        await loginPage.clickPasswordVisibilityToggle();
      });

      await screenshotStep('Confirm the password becomes visible', async () => {
        await loginPage.expectPasswordVisible(password);
      });

      await screenshotStep('Click the eye icon again', async () => {
        await loginPage.clickPasswordVisibilityToggle();
      });

      await screenshotStep('Confirm the password is hidden', async () => {
        await loginPage.expectPasswordHidden(password);
      });
    }
  );

  test(
    'Verify Forgot Password navigation',
    { tag: ['@regression', '@positive', '@functional'] },
    async ({ loginPage, forgotPasswordPage, screenshotStep }) => {
      test.setTimeout(60_000);

      await screenshotStep('Open the Admin Login page', async () => {
        await loginPage.goto();
        await loginPage.expectLoaded();
        await expect(loginPage.heading).toBeAttached();
      });

      await screenshotStep('Click Forgot Password', async () => {
        await loginPage.clickForgotPassword();
      });

      await screenshotStep('Confirm the Forgot Password page is displayed', async () => {
        await forgotPasswordPage.expectLoaded();
      });
    }
  );
});
