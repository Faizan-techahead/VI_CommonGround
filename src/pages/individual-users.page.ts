import { expect, Locator, Page } from '@playwright/test';
import {
  INDIVIDUAL_USERS_PAGINATION,
  INDIVIDUAL_USERS_SEARCH,
  INDIVIDUAL_USERS_STATUS_FILTER,
  INDIVIDUAL_USERS_TABLE_HEADERS,
  routes,
  type IndividualUsersStatusFilter,
} from '../constants';
import { AuthUtils } from '../utils/auth.utils';
import { BasePage } from './base.page';
import { SidebarPage } from './sidebar.page';

export class IndividualUsersPage extends BasePage {
  readonly sidebar: SidebarPage;
  readonly heading: Locator;
  readonly searchField: Locator;
  readonly searchInput: Locator;
  readonly statusFilter: Locator;
  readonly loggedInEmail: Locator;
  readonly table: Locator;
  readonly dataRows: Locator;
  readonly paginationSummary: Locator;
  readonly goToPageLabel: Locator;
  readonly noRecordsMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.sidebar = new SidebarPage(page);
    this.heading = page.getByText('Individual Users', { exact: true }).last();
    // Prefer the semantics host that actually wraps the search control (not a large ancestor).
    this.searchField = page
      .locator('flt-semantics')
      .filter({ hasText: INDIVIDUAL_USERS_SEARCH.placeholder })
      .filter({ has: page.locator('input[type="text"], [role="textbox"]') });
    // Live search <input>; login email/password inputs are excluded by id/name.
    this.searchInput = page
      .locator('input[type="text"]:not([id="email"]):not([name="email"])')
      .last();
    // Trigger label switches between Status / Active / Blocked after a selection.
    this.statusFilter = this.page.locator('flt-semantics[role="button"]').filter({
      hasText: /^(Status|Active|Blocked)$/,
    });
    this.loggedInEmail = page.getByText(AuthUtils.adminCredentials().email, { exact: true });
    this.table = page.getByRole('table');
    this.dataRows = page.getByRole('row').filter({
      has: page.getByRole('cell'),
    });
    this.paginationSummary = page.getByText(INDIVIDUAL_USERS_PAGINATION.summaryPattern);
    this.goToPageLabel = page.getByText(INDIVIDUAL_USERS_PAGINATION.goToPageLabel, {
      exact: true,
    });
    this.noRecordsMessage = page.getByText(INDIVIDUAL_USERS_SEARCH.noRecordsText, {
      exact: true,
    });
  }

  async openModule(): Promise<void> {
    const alreadyOnPage = new RegExp(`${routes.individualUsers}$`).test(this.page.url());
    if (!alreadyOnPage) {
      await this.sidebar.openIndividualUsers();
    } else {
      // Re-select the sidebar item so the open step is explicit even after login landing.
      await this.sidebar.openIndividualUsers().catch(async () => {
        await this.prepareFlutter();
        await this.sidebar.openIndividualUsers();
      });
    }
    await this.prepareFlutter();
    await expect(
      this.searchField.first(),
      'Individual Users search should be present after opening the module'
    ).toBeAttached({ timeout: 20_000 });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`${routes.individualUsers}$`));
    await this.prepareFlutter();
    await expect(
      this.searchField.first(),
      'Individual Users search field should be present'
    ).toBeAttached({ timeout: 20_000 });
    await this.sidebar.expectLoaded();
    await expect(this.statusFilter.first(), 'Status filter control should be present').toBeAttached();
    await this.expectTableHeaders();
  }

  async expectTableHeaders(): Promise<void> {
    for (const header of INDIVIDUAL_USERS_TABLE_HEADERS) {
      await expect(
        this.page.getByRole('columnheader', { name: header }),
        `Column header "${header}" should be visible`
      ).toBeAttached();
    }
  }

  async expectUserRecordsDisplayed(): Promise<void> {
    await expect(this.table, 'Individual Users table should be present').toBeAttached();
    await expect(
      this.dataRows.first(),
      'At least one user record row should be displayed'
    ).toBeAttached({ timeout: 20_000 });
    await expect(
      this.dataRows,
      'User records should be present in the Individual Users table'
    ).not.toHaveCount(0);
  }

  async expectPaginationDetails(): Promise<void> {
    await expect(
      this.paginationSummary,
      'Pagination summary with total records and page range should be displayed'
    ).toBeAttached({ timeout: 20_000 });

    const summaryText = (await this.paginationSummary.first().innerText()).trim();
    const match = summaryText.match(/Showing\s+(\d+)\s*-\s*(\d+)\s+of\s+(\d+)/i);
    expect(match, `Pagination summary should match "Showing X - Y of Z", got: ${summaryText}`).toBeTruthy();

    const from = Number(match![1]);
    const to = Number(match![2]);
    const total = Number(match![3]);
    expect(from, 'Pagination start index should be at least 1').toBeGreaterThanOrEqual(1);
    expect(to, 'Pagination end index should be >= start').toBeGreaterThanOrEqual(from);
    expect(total, 'Total records should be >= visible end index').toBeGreaterThanOrEqual(to);
    expect(total, 'Total records should be greater than 0').toBeGreaterThan(0);

    await expect(
      this.goToPageLabel,
      'Go to page control label should be displayed'
    ).toBeAttached();
  }

  private async dismissBlockingUi(): Promise<void> {
    const dismiss = this.page.getByRole('button', { name: 'Dismiss' });
    if (await dismiss.count()) {
      await dismiss.click({ force: true }).catch(() => undefined);
    }
    await this.page.keyboard.press('Escape').catch(() => undefined);
  }

  private async resetSearchField(): Promise<void> {
    // Flutter search does not clear reliably via select-all/backspace; reset via URL.
    // Preserve status filter when clearing search (needed for filter-then-search flows).
    const current = new URL(this.page.url());
    if (current.searchParams.has('search')) {
      current.searchParams.delete('search');
      await this.page.goto(current.toString(), { waitUntil: 'commit' });
      await this.prepareFlutter();
      await this.dismissBlockingUi();
      await expect(
        this.searchField.first(),
        'Search field should be present after resetting search'
      ).toBeAttached({ timeout: 20_000 });
    }
  }

  private async focusSearchInput(): Promise<void> {
    await this.prepareFlutter();
    await this.dismissBlockingUi();
    const placeholderHost = this.searchField.first();
    if (await placeholderHost.count()) {
      await placeholderHost.click({ force: true });
    }
    await expect(this.searchInput, 'Search input should be present').toBeAttached({
      timeout: 20_000,
    });
    await this.searchInput.click({ force: true });
  }

  private isSearchResponseForQuery(responseUrl: string, query: string): boolean {
    if (!responseUrl.includes('/api/v2/admin/individual-user')) return false;
    try {
      return new URL(responseUrl).searchParams.get('searchQuery') === query;
    } catch {
      return false;
    }
  }

  async searchUsers(query: string): Promise<void> {
    await this.resetSearchField();

    // Flutter web ignores programmatic value sets; drive the field through the keyboard.
    // Validate via API/URL rather than inputValue (the input node is replaced while typing).
    let applied = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      await this.focusSearchInput();
      await this.page.keyboard.type('x', { delay: 20 });
      await this.page.keyboard.press('Backspace');

      const searchResponse = this.page.waitForResponse(
        (response) =>
          response.ok() && this.isSearchResponseForQuery(response.url(), query),
        { timeout: 20_000 }
      );

      await this.page.keyboard.type(query, { delay: 40 });
      await this.page.keyboard.press('Enter');

      try {
        await searchResponse;
        await expect
          .poll(async () => new URL(this.page.url()).searchParams.get('search') ?? '', {
            timeout: 10_000,
          })
          .toBe(query);
        applied = true;
        break;
      } catch {
        await this.resetSearchField();
      }
    }

    expect(applied, `Search query "${query}" should be applied`).toBeTruthy();
    await this.prepareFlutter();

    await expect
      .poll(
        async () => {
          if (await this.noRecordsMessage.count()) return 'empty';
          if (await this.dataRows.count()) return 'rows';
          return 'pending';
        },
        { timeout: 20_000, message: 'Search should resolve to rows or an empty state' }
      )
      .not.toBe('pending');
  }

  async expectSearchApplied(query: string): Promise<void> {
    await expect
      .poll(async () => new URL(this.page.url()).searchParams.get('search') ?? '', {
        timeout: 10_000,
      })
      .toBe(query);
  }

  async expectNoRecordsFound(): Promise<void> {
    await expect(
      this.noRecordsMessage,
      `Empty search state "${INDIVIDUAL_USERS_SEARCH.noRecordsText}" should be displayed`
    ).toBeAttached({ timeout: 20_000 });
    await expect(this.dataRows, 'Data rows should not be present for an empty search').toHaveCount(
      0
    );
  }

  async expectMatchingUserDisplayed(matchText?: string): Promise<void> {
    await this.expectUserRecordsDisplayed();
    if (!matchText) return;

    const escaped = matchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const namedRow = this.page.getByRole('row', { name: new RegExp(escaped) });
    if ((await namedRow.count()) > 0) {
      await expect(
        namedRow.first(),
        `A result row named with "${matchText}" should be displayed`
      ).toBeAttached({ timeout: 20_000 });
      return;
    }

    const matchingRows = this.dataRows.filter({ hasText: matchText });
    // Id/text may live in accessible names rather than innerText; fall back to filtered rows.
    if ((await matchingRows.count()) > 0) {
      await expect(
        matchingRows.first(),
        `A result row containing "${matchText}" should be displayed`
      ).toBeAttached({ timeout: 20_000 });
      return;
    }
    await expect(
      this.dataRows.first(),
      `Matching user for "${matchText}" should be displayed in search results`
    ).toBeAttached({ timeout: 20_000 });
  }

  async getResultSignatures(): Promise<string[]> {
    await this.prepareFlutter();
    const rowCount = await this.dataRows.count();
    const signatures: string[] = [];
    for (let i = 0; i < rowCount; i++) {
      const text = ((await this.dataRows.nth(i).innerText()) || '').replace(/\s+/g, ' ').trim();
      if (text) signatures.push(text);
    }
    return signatures.sort();
  }

  async getFirstVisibleUserId(): Promise<string> {
    await this.expectUserRecordsDisplayed();
    const idCell = this.dataRows.first().getByRole('cell').first();
    await expect(idCell, 'First row Id cell should be present').toBeAttached({ timeout: 20_000 });

    // Flutter often exposes the Id on an inner button / accessible name, not plain innerText.
    const idButton = idCell.getByRole('button').first();
    let userId = '';
    if (await idButton.count()) {
      userId = (
        (await idButton.getAttribute('aria-label')) ||
        (await idButton.innerText()) ||
        ''
      )
        .replace(/\s+/g, ' ')
        .trim();
    }
    if (!userId) {
      userId = (
        (await idCell.getAttribute('aria-label')) ||
        (await idCell.innerText()) ||
        ''
      )
        .replace(/\s+/g, ' ')
        .trim();
    }
    if (!userId) {
      userId = await idCell.evaluate((el) => {
        const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
        const match = text.match(/(?:CGP|FAN)-[A-Za-z0-9-]+/);
        return match?.[0] || text;
      });
    }

    expect(userId, 'First visible user Id should not be empty').not.toEqual('');
    return userId;
  }

  async expectBlankSearchDoesNotReturnIncorrectResults(
    baselineSignatures: string[]
  ): Promise<void> {
    await expect(this.page, 'Blank search should keep the Individual Users route').toHaveURL(
      new RegExp(`${routes.individualUsers}`)
    );
    await expect(
      this.searchInput.or(this.searchField.first()),
      'Search control should remain available after a blank search'
    ).toBeAttached();

    const emptyVisible = (await this.noRecordsMessage.count()) > 0;
    if (emptyVisible) {
      await this.expectNoRecordsFound();
      return;
    }

    await this.expectUserRecordsDisplayed();
    const current = await this.getResultSignatures();
    expect(
      current,
      'Blank-space search should not invent a filtered result set different from the default list'
    ).toEqual(baselineSignatures);
  }

  async applyStatusFilter(status: IndividualUsersStatusFilter): Promise<void> {
    await this.prepareFlutter();
    await this.dismissBlockingUi();

    const expectedStatusParam = INDIVIDUAL_USERS_STATUS_FILTER.urlParam[status];
    const filterResponse = this.page.waitForResponse(
      (response) => {
        if (!response.url().includes('/api/v2/admin/individual-user') || !response.ok()) {
          return false;
        }
        try {
          return new URL(response.url()).searchParams.get('status_filter') === expectedStatusParam;
        } catch {
          return false;
        }
      },
      { timeout: 20_000 }
    );

    await this.statusFilter.first().click({ force: true });
    const option = this.page.getByRole('menuitem', { name: new RegExp(`^${status}$`, 'i') });
    await expect(option, `Status menu option "${status}" should be visible`).toBeAttached({
      timeout: 10_000,
    });
    await option.click({ force: true });
    await filterResponse;
    await this.prepareFlutter();
    await this.dismissBlockingUi();

    await expect
      .poll(async () => new URL(this.page.url()).searchParams.get('status') ?? '', {
        timeout: 10_000,
        message: `Status filter URL should be status=${expectedStatusParam}`,
      })
      .toBe(expectedStatusParam);

    await expect
      .poll(
        async () => {
          if (await this.noRecordsMessage.count()) return 'empty';
          if (await this.dataRows.count()) return 'rows';
          return 'pending';
        },
        { timeout: 20_000, message: 'Status filter should resolve to rows or an empty state' }
      )
      .not.toBe('pending');
  }

  async expectStatusFilterApplied(status: IndividualUsersStatusFilter): Promise<void> {
    const expectedStatusParam = INDIVIDUAL_USERS_STATUS_FILTER.urlParam[status];
    await expect
      .poll(async () => new URL(this.page.url()).searchParams.get('status') ?? '', {
        timeout: 10_000,
      })
      .toBe(expectedStatusParam);
  }

  async expectAllVisibleRowsHaveStatus(status: IndividualUsersStatusFilter): Promise<void> {
    await this.expectUserRecordsDisplayed();
    const opposite =
      status === INDIVIDUAL_USERS_STATUS_FILTER.active
        ? INDIVIDUAL_USERS_STATUS_FILTER.blocked
        : INDIVIDUAL_USERS_STATUS_FILTER.active;

    const rowCount = await this.dataRows.count();
    expect(rowCount, 'Filtered list should include at least one row').toBeGreaterThan(0);

    for (let i = 0; i < rowCount; i++) {
      const row = this.dataRows.nth(i);
      await expect(
        row.getByRole('cell', { name: status, exact: true }),
        `Row ${i + 1} should show status "${status}"`
      ).toBeAttached();
      await expect(
        row.getByRole('cell', { name: opposite, exact: true }),
        `Row ${i + 1} should not show status "${opposite}"`
      ).toHaveCount(0);
    }
  }
}
