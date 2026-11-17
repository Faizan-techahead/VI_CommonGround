/** Shared Individual Users table and pagination expectations. */

export const INDIVIDUAL_USERS_TABLE_HEADERS = [
  'Id',
  'User Name',
  'Email Address',
  'Sign-up method',
  'Date of Registration',
  'Status',
  'Action',
] as const;

export const INDIVIDUAL_USERS_PAGINATION = {
  summaryPattern: /Showing\s+\d+\s*-\s*\d+\s+of\s+\d+/,
  goToPageLabel: 'Go to page no.',
} as const;

/**
 * Search scenario inputs (TC-05..TC-11).
 * - userId: optional override (spreadsheet used FAN-11). When unset, TC-05 reads a visible Id from the list.
 * - email: full address required (masked spreadsheet values are not searchable). Override with IU_SEARCH_EMAIL.
 * Empty-state copy in the app is "No data available" (spreadsheet said "No Records Found").
 */
export const INDIVIDUAL_USERS_SEARCH = {
  userId: process.env.IU_SEARCH_USER_ID || '',
  username: process.env.IU_SEARCH_USERNAME || 'Gaurav',
  email: process.env.IU_SEARCH_EMAIL || 'gaurav@yopmail.com',
  invalidUserId: process.env.IU_SEARCH_INVALID_USER_ID || 'FAN-99999',
  specialCharacters: '@#$%^',
  blankSpace: ' ',
  usernameLower: 'gaurav',
  usernameUpper: 'GAURAV',
  noRecordsText: 'No data available',
  placeholder: 'Search by ID, name, email',
} as const;

/** Status filter options (TC-12..TC-14). URL uses status=1 Active, status=2 Blocked. */
export const INDIVIDUAL_USERS_STATUS_FILTER = {
  active: 'Active',
  blocked: 'Blocked',
  urlParam: {
    Active: '1',
    Blocked: '2',
  },
} as const;

export type IndividualUsersStatusFilter =
  (typeof INDIVIDUAL_USERS_STATUS_FILTER)['active'] | (typeof INDIVIDUAL_USERS_STATUS_FILTER)['blocked'];
