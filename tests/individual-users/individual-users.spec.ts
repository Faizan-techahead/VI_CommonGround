import {
  INDIVIDUAL_USERS_SEARCH,
  INDIVIDUAL_USERS_STATUS_FILTER,
} from '../../src/constants';
import { AuthUtils } from '../../src/utils/auth.utils';
import { expect, test } from '../fixtures/test';

test.describe('Individual Users', { tag: '@regression' }, () => {
  // Shared admin login against Flutter web is more stable when these cases run one at a time.
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ loginPage }) => {
    test.setTimeout(120_000);
    await AuthUtils.signInAsAdmin(loginPage);
  });

  test(
    'Verify Individual Users page loads successfully',
    { tag: ['@regression', '@positive', '@functional'] },
    async ({ individualUsersPage, screenshotStep }) => {
      await screenshotStep('Open Individual Users module', async () => {
        await individualUsersPage.openModule();
      });

      await screenshotStep('Confirm the user list loads successfully', async () => {
        await individualUsersPage.expectLoaded();
        await expect(individualUsersPage.heading).toBeAttached();
      });
    }
  );

  test(
    'Verify all table headers are displayed correctly',
    { tag: ['@regression', '@positive', '@ui'] },
    async ({ individualUsersPage, screenshotStep }) => {
      await screenshotStep('Open Individual Users page', async () => {
        await individualUsersPage.openModule();
        await individualUsersPage.expectLoaded();
      });

      await screenshotStep('Confirm all column headers are visible', async () => {
        await individualUsersPage.expectTableHeaders();
      });
    }
  );

  test(
    'Verify user records are displayed correctly',
    { tag: ['@regression', '@positive', '@functional'] },
    async ({ individualUsersPage, screenshotStep }) => {
      await screenshotStep('Open Individual Users page', async () => {
        await individualUsersPage.openModule();
        await individualUsersPage.expectLoaded();
      });

      await screenshotStep('Confirm user records are displayed', async () => {
        await individualUsersPage.expectUserRecordsDisplayed();
      });
    }
  );

  test(
    'Verify pagination details',
    { tag: ['@regression', '@positive', '@functional'] },
    async ({ individualUsersPage, screenshotStep }) => {
      await screenshotStep('Navigate to Individual Users list', async () => {
        await individualUsersPage.openModule();
        await individualUsersPage.expectLoaded();
      });

      await screenshotStep(
        'Confirm total records and page number are displayed correctly',
        async () => {
          await individualUsersPage.expectPaginationDetails();
        }
      );
    }
  );

  test(
    'Verify search by User ID',
    { tag: ['@regression', '@positive', '@functional'] },
    async ({ individualUsersPage, screenshotStep }) => {
      let userId = INDIVIDUAL_USERS_SEARCH.userId;

      await screenshotStep('Open Individual Users page', async () => {
        await individualUsersPage.openModule();
        await individualUsersPage.expectLoaded();
        if (!userId) {
          userId = await individualUsersPage.getFirstVisibleUserId();
        }
      });

      await screenshotStep(`Search by User ID ${userId}`, async () => {
        await individualUsersPage.searchUsers(userId);
        await individualUsersPage.expectSearchApplied(userId);
      });

      await screenshotStep('Confirm the matching user is displayed', async () => {
        await individualUsersPage.expectMatchingUserDisplayed(userId);
      });
    }
  );

  test(
    'Verify search by username',
    { tag: ['@regression', '@positive', '@functional'] },
    async ({ individualUsersPage, screenshotStep }) => {
      await screenshotStep('Open Individual Users page', async () => {
        await individualUsersPage.openModule();
        await individualUsersPage.expectLoaded();
      });

      await screenshotStep(`Search username ${INDIVIDUAL_USERS_SEARCH.username}`, async () => {
        await individualUsersPage.searchUsers(INDIVIDUAL_USERS_SEARCH.username);
        await individualUsersPage.expectSearchApplied(INDIVIDUAL_USERS_SEARCH.username);
      });

      await screenshotStep('Confirm the correct user is displayed', async () => {
        await individualUsersPage.expectMatchingUserDisplayed(INDIVIDUAL_USERS_SEARCH.username);
      });
    }
  );

  test(
    'Verify search by email',
    { tag: ['@regression', '@positive', '@functional'] },
    async ({ individualUsersPage, screenshotStep }) => {
      await screenshotStep('Open Individual Users page', async () => {
        await individualUsersPage.openModule();
        await individualUsersPage.expectLoaded();
      });

      await screenshotStep(`Search email ${INDIVIDUAL_USERS_SEARCH.email}`, async () => {
        await individualUsersPage.searchUsers(INDIVIDUAL_USERS_SEARCH.email);
        await individualUsersPage.expectSearchApplied(INDIVIDUAL_USERS_SEARCH.email);
      });

      await screenshotStep('Confirm the correct user is displayed', async () => {
        await individualUsersPage.expectMatchingUserDisplayed(INDIVIDUAL_USERS_SEARCH.email);
      });
    }
  );

  test(
    'Verify search with invalid User ID',
    { tag: ['@regression', '@negative', '@functional'] },
    async ({ individualUsersPage, screenshotStep }) => {
      await screenshotStep('Open Individual Users page', async () => {
        await individualUsersPage.openModule();
        await individualUsersPage.expectLoaded();
      });

      await screenshotStep(
        `Search invalid User ID ${INDIVIDUAL_USERS_SEARCH.invalidUserId}`,
        async () => {
          await individualUsersPage.searchUsers(INDIVIDUAL_USERS_SEARCH.invalidUserId);
          await individualUsersPage.expectSearchApplied(INDIVIDUAL_USERS_SEARCH.invalidUserId);
        }
      );

      await screenshotStep('Confirm no records are displayed', async () => {
        await individualUsersPage.expectNoRecordsFound();
      });
    }
  );

  test(
    'Verify search with special characters',
    { tag: ['@regression', '@edge-case', '@functional'] },
    async ({ individualUsersPage, screenshotStep }) => {
      await screenshotStep('Open Individual Users page', async () => {
        await individualUsersPage.openModule();
        await individualUsersPage.expectLoaded();
      });

      await screenshotStep(
        `Search using ${INDIVIDUAL_USERS_SEARCH.specialCharacters}`,
        async () => {
          await individualUsersPage.searchUsers(INDIVIDUAL_USERS_SEARCH.specialCharacters);
          await individualUsersPage.expectSearchApplied(
            INDIVIDUAL_USERS_SEARCH.specialCharacters
          );
        }
      );

      await screenshotStep('Confirm the system does not crash and no records are returned', async () => {
        await expect(individualUsersPage.heading).toBeAttached();
        await individualUsersPage.expectNoRecordsFound();
      });
    }
  );

  test(
    'Verify search with blank spaces',
    { tag: ['@regression', '@edge-case', '@functional'] },
    async ({ individualUsersPage, screenshotStep }) => {
      let baselineSignatures: string[] = [];

      await screenshotStep('Open Individual Users page', async () => {
        await individualUsersPage.openModule();
        await individualUsersPage.expectLoaded();
        await individualUsersPage.expectUserRecordsDisplayed();
        baselineSignatures = await individualUsersPage.getResultSignatures();
      });

      await screenshotStep('Enter a blank space in the search field', async () => {
        await individualUsersPage.searchUsers(INDIVIDUAL_USERS_SEARCH.blankSpace);
        await individualUsersPage.expectSearchApplied(INDIVIDUAL_USERS_SEARCH.blankSpace);
      });

      await screenshotStep('Confirm blank search does not return incorrect results', async () => {
        await individualUsersPage.expectBlankSearchDoesNotReturnIncorrectResults(
          baselineSignatures
        );
      });
    }
  );

  test(
    'Verify search is case insensitive',
    { tag: ['@regression', '@edge-case', '@functional'] },
    async ({ individualUsersPage, screenshotStep }) => {
      let lowerSignatures: string[] = [];

      await screenshotStep('Open Individual Users page', async () => {
        await individualUsersPage.openModule();
        await individualUsersPage.expectLoaded();
      });

      await screenshotStep(
        `Search with lowercase ${INDIVIDUAL_USERS_SEARCH.usernameLower}`,
        async () => {
          await individualUsersPage.searchUsers(INDIVIDUAL_USERS_SEARCH.usernameLower);
          await individualUsersPage.expectSearchApplied(INDIVIDUAL_USERS_SEARCH.usernameLower);
          await individualUsersPage.expectUserRecordsDisplayed();
          lowerSignatures = await individualUsersPage.getResultSignatures();
        }
      );

      await screenshotStep(
        `Clear search and search with uppercase ${INDIVIDUAL_USERS_SEARCH.usernameUpper}`,
        async () => {
          await individualUsersPage.searchUsers(INDIVIDUAL_USERS_SEARCH.usernameUpper);
          await individualUsersPage.expectSearchApplied(INDIVIDUAL_USERS_SEARCH.usernameUpper);
          await individualUsersPage.expectUserRecordsDisplayed();
        }
      );

      await screenshotStep('Confirm the same results are displayed', async () => {
        const upperSignatures = await individualUsersPage.getResultSignatures();
        expect(
          upperSignatures,
          'Lowercase and uppercase username searches should return the same results'
        ).toEqual(lowerSignatures);
      });
    }
  );

  test(
    'Verify Active status filter',
    { tag: ['@regression', '@positive', '@functional'] },
    async ({ individualUsersPage, screenshotStep }) => {
      await screenshotStep('Open Individual Users page', async () => {
        await individualUsersPage.openModule();
        await individualUsersPage.expectLoaded();
      });

      await screenshotStep('Apply Active status filter', async () => {
        await individualUsersPage.applyStatusFilter(INDIVIDUAL_USERS_STATUS_FILTER.active);
        await individualUsersPage.expectStatusFilterApplied(INDIVIDUAL_USERS_STATUS_FILTER.active);
      });

      await screenshotStep('Confirm only Active users are displayed', async () => {
        await individualUsersPage.expectAllVisibleRowsHaveStatus(
          INDIVIDUAL_USERS_STATUS_FILTER.active
        );
      });
    }
  );

  test(
    'Verify Blocked status filter',
    { tag: ['@regression', '@positive', '@functional'] },
    async ({ individualUsersPage, screenshotStep }) => {
      await screenshotStep('Open Individual Users page', async () => {
        await individualUsersPage.openModule();
        await individualUsersPage.expectLoaded();
      });

      await screenshotStep('Apply Blocked status filter', async () => {
        await individualUsersPage.applyStatusFilter(INDIVIDUAL_USERS_STATUS_FILTER.blocked);
        await individualUsersPage.expectStatusFilterApplied(INDIVIDUAL_USERS_STATUS_FILTER.blocked);
      });

      await screenshotStep('Confirm only Blocked users are displayed', async () => {
        await individualUsersPage.expectAllVisibleRowsHaveStatus(
          INDIVIDUAL_USERS_STATUS_FILTER.blocked
        );
      });
    }
  );

  test(
    'Verify search after applying filter',
    { tag: ['@regression', '@edge-case', '@functional'] },
    async ({ individualUsersPage, screenshotStep }) => {
      await screenshotStep('Open Individual Users page', async () => {
        await individualUsersPage.openModule();
        await individualUsersPage.expectLoaded();
      });

      await screenshotStep('Apply Active status filter', async () => {
        await individualUsersPage.applyStatusFilter(INDIVIDUAL_USERS_STATUS_FILTER.active);
        await individualUsersPage.expectStatusFilterApplied(INDIVIDUAL_USERS_STATUS_FILTER.active);
      });

      await screenshotStep(`Search by email ${INDIVIDUAL_USERS_SEARCH.email}`, async () => {
        await individualUsersPage.searchUsers(INDIVIDUAL_USERS_SEARCH.email);
        await individualUsersPage.expectSearchApplied(INDIVIDUAL_USERS_SEARCH.email);
        await individualUsersPage.expectStatusFilterApplied(INDIVIDUAL_USERS_STATUS_FILTER.active);
      });

      await screenshotStep('Confirm correct filtered results appear', async () => {
        await individualUsersPage.expectMatchingUserDisplayed(INDIVIDUAL_USERS_SEARCH.email);
        await individualUsersPage.expectAllVisibleRowsHaveStatus(
          INDIVIDUAL_USERS_STATUS_FILTER.active
        );
      });
    }
  );
});
