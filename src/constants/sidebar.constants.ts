/** Shared sidebar labels for Flutter admin navigation. */

export const SIDEBAR_ITEMS = {
  individualUsers: 'Individual Users',
  companyUsers: 'Company Users',
  deletedAppUsers: 'Deleted App Users',
  inputCategories: 'Input Categories',
  events: 'Events',
  moderationCenter: 'Moderation Center',
  adminSettings: 'Admin Settings',
  consentAuditLog: 'Consent Audit Log',
  contentVersions: 'Content Versions',
  userAccessManagement: 'User & Access Management',
  monitoring: 'Monitoring',
} as const;

export type SidebarItem = (typeof SIDEBAR_ITEMS)[keyof typeof SIDEBAR_ITEMS];
