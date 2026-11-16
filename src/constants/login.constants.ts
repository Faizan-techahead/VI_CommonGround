/**
 * Login UI expectation constants grounded in the live admin app.
 */
export const LOGIN_ERRORS = {
  adminDoesNotExist: 'Admin does not exists',
  invalidCredentials: 'Invalid credentials',
  emailCannotBeEmpty: 'Email cannot be empty',
  invalidEmailFormat: 'Please enter a valid email address',
} as const;

export const LOGIN_TEST_DATA = {
  invalidEmail: 'invalid@test.com',
  invalidEmailFormat: 'admin.com',
  incorrectPassword: 'WrongPassword123!',
} as const;
