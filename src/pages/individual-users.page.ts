import { expect, Locator, Page } from '@playwright/test';
import { routes } from '../constants';
import { AuthUtils } from '../utils/auth.utils';
import { BasePage } from './base.page';
import { SidebarPage } from './sidebar.page';

export class IndividualUsersPage extends BasePage {
  readonly sidebar: SidebarPage;
  readonly heading: Locator;
  readonly searchField: Locator;
  readonly statusFilter: Locator;
  readonly loggedInEmail: Locator;

  constructor(page: Page) {
    super(page);
    this.sidebar = new SidebarPage(page);
    this.heading = page.getByText('Individual Users', { exact: true }).last();
    this.searchField = page.locator('flt-semantics').filter({
      hasText: 'Search by ID, name, email',
    });
    this.statusFilter = this.flutterButton('Status');
    this.loggedInEmail = page.getByText(AuthUtils.adminCredentials().email, { exact: true });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`${routes.individualUsers}$`));
    await this.sidebar.expectLoaded();
    await expect(this.searchField.first()).toBeAttached();
    await expect(this.statusFilter).toBeAttached();
    await expect(this.page.getByRole('columnheader', { name: 'Id' })).toBeAttached();
    await expect(this.page.getByRole('columnheader', { name: 'User Name' })).toBeAttached();
    await expect(this.page.getByRole('columnheader', { name: 'Email Address' })).toBeAttached();
    await expect(this.page.getByRole('columnheader', { name: 'Sign-up method' })).toBeAttached();
    await expect(this.page.getByRole('columnheader', { name: 'Date of Registration' })).toBeAttached();
    await expect(this.page.getByRole('columnheader', { name: 'Status' })).toBeAttached();
    await expect(this.page.getByRole('columnheader', { name: 'Action' })).toBeAttached();
  }
}
