/**
 * Identifies the feature that opened a snackbar message, so a feature can
 * dismiss its own stale error without dismissing an unread error opened by
 * another feature. Deliberately a stable per-feature constant rather than a
 * per-hook-instance handle: the provider is mounted in `_app` and outlives
 * page navigation, so ownership has to survive the consuming hook unmounting
 * and remounting on a different page.
 *
 * Ownership is per-feature, not per-call — the scope carries no identity for
 * the individual message. Where one feature runs concurrent operations that
 * aren't serialised by a shared pending state (e.g. the per-row unlink buttons
 * in `IntegratedObjectSourceDatasetsView`, each holding its own `isPending`),
 * a later success can still dismiss an unread error raised moments earlier by
 * a sibling operation under the same scope. Narrower than the unconditional
 * `closeSnackbar()` this replaced, but not closed; see #1564.
 */
export const SNACKBAR_SCOPE = {
  CREATE_ATLAS_REVISION: "CREATE_ATLAS_REVISION",
  DELETE_SOURCE_STUDY: "DELETE_SOURCE_STUDY",
  EDIT_FILE_ARCHIVED: "EDIT_FILE_ARCHIVED",
  EDIT_INTEGRATED_OBJECT_SOURCE_DATASETS:
    "EDIT_INTEGRATED_OBJECT_SOURCE_DATASETS",
  PUBLISH_ATLAS: "PUBLISH_ATLAS",
} as const;

export type SnackbarScope =
  (typeof SNACKBAR_SCOPE)[keyof typeof SNACKBAR_SCOPE];
