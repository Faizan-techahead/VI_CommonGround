import type { LoginPage } from '../pages/login.page';

export class AuthUtils {
  static adminCredentials(): { email: string; password: string } {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) {
      throw new Error(
        'Set ADMIN_EMAIL and ADMIN_PASSWORD in .env or your shell before running admin tests.',
      );
    }
    return { email, password };
  }

  static async signInAsAdmin(loginPage: LoginPage): Promise<void> {
    const { email, password } = AuthUtils.adminCredentials();
    await loginPage.goto();
    await loginPage.login(email, password);
    await loginPage.expectSuccessfulLogin();
  }
}
