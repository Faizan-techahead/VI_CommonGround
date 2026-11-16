import { expect, Page } from '@playwright/test';
import { routes, SIDEBAR_ITEMS } from '../constants';
import { BasePage } from './base.page';

export class SidebarPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async expectLoaded(): Promise<void> {
    await expect(this.flutterButton(SIDEBAR_ITEMS.individualUsers)).toBeAttached();
    await expect(this.flutterButton(SIDEBAR_ITEMS.companyUsers)).toBeAttached();
  }

  async openIndividualUsers(): Promise<void> {
    await this.openItem(SIDEBAR_ITEMS.individualUsers, routes.individualUsers);
  }

  async openCompanyUsers(): Promise<void> {
    await this.openItem(SIDEBAR_ITEMS.companyUsers, routes.companyUsers);
  }

  async openDeletedAppUsers(): Promise<void> {
    await this.openItem(SIDEBAR_ITEMS.deletedAppUsers, routes.deletedAppUsers);
  }

  async openInputCategories(): Promise<void> {
    await this.openItem(SIDEBAR_ITEMS.inputCategories, routes.inputCategories);
  }

  async openEvents(): Promise<void> {
    await this.openItem(SIDEBAR_ITEMS.events, routes.events);
  }

  async openModerationCenter(): Promise<void> {
    await this.openItem(SIDEBAR_ITEMS.moderationCenter, routes.moderationCenter);
  }

  async openAdminSettings(): Promise<void> {
    await this.openItem(SIDEBAR_ITEMS.adminSettings, routes.adminSettings);
  }

  async openConsentAuditLog(): Promise<void> {
    await this.openItem(SIDEBAR_ITEMS.consentAuditLog, routes.consentAuditLog);
  }

  async openContentVersions(): Promise<void> {
    await this.openItem(SIDEBAR_ITEMS.contentVersions, routes.contentVersions);
  }

  async expandUserAccessManagement(): Promise<void> {
    await this.forceClick(this.flutterButton(SIDEBAR_ITEMS.userAccessManagement));
  }

  async expandMonitoring(): Promise<void> {
    await this.forceClick(this.flutterButton(SIDEBAR_ITEMS.monitoring));
  }

  private async openItem(label: string, path: string): Promise<void> {
    await this.forceClick(this.flutterButton(label));
    await this.page.waitForURL(`**${path}`, { timeout: 20_000 });
  }
}
