/**
 * Shown when the endpoint answers 201 but its body doesn't identify the new
 * atlas. The version exists by then, so the message says so: retrying would
 * fail, because the original atlas is no longer the latest revision.
 */
export const UNREADABLE_CREATED_ATLAS_MESSAGE =
  "The new version was created, but its details couldn't be read. Open it from the atlases list.";
