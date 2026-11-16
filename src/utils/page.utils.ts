import type { Page } from '@playwright/test';
import { FlutterUtil } from './flutter.utils';

export class PageUtils {
  static async waitForPageIdle(page: Page): Promise<void> {
    await page.waitForLoadState('domcontentloaded');
  }

  static async prepareFlutter(page: Page): Promise<void> {
    await FlutterUtil.prepare(page);
  }
}
