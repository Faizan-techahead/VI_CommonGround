import { test as base, expect } from '@playwright/test';
import { AdminSettingsPage } from '../../src/pages/admin-settings.page';
import { CompanyUsersPage } from '../../src/pages/company-users.page';
import { ConsentAuditLogPage } from '../../src/pages/consent-audit-log.page';
import { ContentVersionsPage } from '../../src/pages/content-versions.page';
import { DeletedAppUsersPage } from '../../src/pages/deleted-app-users.page';
import { EventsPage } from '../../src/pages/events.page';
import { IndividualUsersPage } from '../../src/pages/individual-users.page';
import { InputCategoriesPage } from '../../src/pages/input-categories.page';
import { ForgotPasswordPage } from '../../src/pages/forgot-password.page';
import { LoginPage } from '../../src/pages/login.page';
import { ModerationCenterPage } from '../../src/pages/moderation-center.page';
import { SidebarPage } from '../../src/pages/sidebar.page';

type TestFixtures = {
  loginPage: LoginPage;
  forgotPasswordPage: ForgotPasswordPage;
  sidebarPage: SidebarPage;
  individualUsersPage: IndividualUsersPage;
  companyUsersPage: CompanyUsersPage;
  deletedAppUsersPage: DeletedAppUsersPage;
  inputCategoriesPage: InputCategoriesPage;
  eventsPage: EventsPage;
  moderationCenterPage: ModerationCenterPage;
  adminSettingsPage: AdminSettingsPage;
  consentAuditLogPage: ConsentAuditLogPage;
  contentVersionsPage: ContentVersionsPage;
  screenshotStep: (title: string, body: () => Promise<void>) => Promise<void>;
};

export const test = base.extend<TestFixtures>({
  screenshotStep: async ({ page }, use, testInfo) => {
    await use(async (title, body) => {
      await base.step(title, async () => {
        try {
          await body();
        } finally {
          if (!page.isClosed()) {
            try {
              await testInfo.attach(title, {
                body: await page.screenshot({ fullPage: true, timeout: 5_000 }),
                contentType: 'image/png',
              });
            } catch (error) {
              console.warn(`Could not capture screenshot for "${title}":`, error);
            }
          }
        }
      });
    });
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  forgotPasswordPage: async ({ page }, use) => {
    await use(new ForgotPasswordPage(page));
  },
  sidebarPage: async ({ page }, use) => {
    await use(new SidebarPage(page));
  },
  individualUsersPage: async ({ page }, use) => {
    await use(new IndividualUsersPage(page));
  },
  companyUsersPage: async ({ page }, use) => {
    await use(new CompanyUsersPage(page));
  },
  deletedAppUsersPage: async ({ page }, use) => {
    await use(new DeletedAppUsersPage(page));
  },
  inputCategoriesPage: async ({ page }, use) => {
    await use(new InputCategoriesPage(page));
  },
  eventsPage: async ({ page }, use) => {
    await use(new EventsPage(page));
  },
  moderationCenterPage: async ({ page }, use) => {
    await use(new ModerationCenterPage(page));
  },
  adminSettingsPage: async ({ page }, use) => {
    await use(new AdminSettingsPage(page));
  },
  consentAuditLogPage: async ({ page }, use) => {
    await use(new ConsentAuditLogPage(page));
  },
  contentVersionsPage: async ({ page }, use) => {
    await use(new ContentVersionsPage(page));
  },
});

export { expect };
