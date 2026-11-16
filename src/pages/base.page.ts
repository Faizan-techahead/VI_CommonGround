import { Locator, Page } from '@playwright/test';
import { FlutterUtil } from '../utils/flutter.utils';
import { flutterLabelPattern } from '../utils/locator.utils';

export class BasePage {
  constructor(protected readonly page: Page) {}

  async prepareFlutter(): Promise<void> {
    await FlutterUtil.prepare(this.page);
  }

  protected flutterButton(label: string): Locator {
    return this.page.locator('flt-semantics[role="button"]').filter({
      hasText: flutterLabelPattern(label),
    });
  }

  protected async forceClick(locator: Locator): Promise<void> {
    await locator.click({ force: true });
  }
}
