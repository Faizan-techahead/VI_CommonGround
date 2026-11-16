import { Page } from '@playwright/test';

export class FlutterUtil {
  static async waitForApp(page: Page): Promise<void> {
    await page.waitForFunction(
      () =>
        Boolean(
          document.querySelector('flt-glass-pane') ||
            document.querySelector('flutter-view') ||
            document.querySelector('canvas')
        ),
      { timeout: 30_000 }
    );
  }

  static async enableSemantics(page: Page): Promise<void> {
    await page.evaluate(() => {
      const placeholder = document.querySelector(
        'flt-semantics-placeholder'
      ) as HTMLElement | null;
      placeholder?.click();
    });

    await page.keyboard.press('Tab');
    await page.locator('flt-semantics').first().waitFor({ state: 'attached', timeout: 15_000 });
  }

  static async prepare(page: Page): Promise<void> {
    await this.waitForApp(page);
    await this.enableSemantics(page);
  }
}
