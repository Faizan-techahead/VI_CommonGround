import { expect, Page } from '@playwright/test';
import { routes } from '../constants';
import { BasePage } from './base.page';
import { SidebarPage } from './sidebar.page';

export class ContentVersionsPage extends BasePage {
  readonly sidebar: SidebarPage;

  constructor(page: Page) {
    super(page);
    this.sidebar = new SidebarPage(page);
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`${routes.contentVersions}$`));
    await this.sidebar.expectLoaded();
  }
}
