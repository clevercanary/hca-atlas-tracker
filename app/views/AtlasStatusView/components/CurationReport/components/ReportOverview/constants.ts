// Height shared by the toolbar's view tabs and filter buttons.
export const TOOLBAR_CONTROL_HEIGHT = 36;

// What the table lists, chosen with the toolbar's view tabs.
export const VIEW = {
  CHECKS: "checks",
  FILES: "files",
  ISSUES: "issues",
} as const;

export type View = (typeof VIEW)[keyof typeof VIEW];
