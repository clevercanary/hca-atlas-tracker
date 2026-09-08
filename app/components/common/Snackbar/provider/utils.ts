import { type SnackbarEntry } from "./types";

/** Source of entry ids, unique for the lifetime of the page. */
let entryCount = 0;

/**
 * Starts an entry's exit transition, leaving it in the list to animate.
 * `onExited` is what removes it.
 * @param entries - Current entries.
 * @param id - Entry to close.
 * @returns entries with the named one marked closed.
 */
export function closeEntry(
  entries: SnackbarEntry[],
  id: SnackbarEntry["id"],
): SnackbarEntry[] {
  return closeMatching(entries, (entry) => entry.id === id);
}

/**
 * Starts the exit transition for the entry one operation raised, leaving every
 * other entry alone.
 * @param entries - Current entries.
 * @param operationKey - Operation whose entry to close.
 * @returns entries with that operation's entry marked closed.
 */
export function closeOperation(
  entries: SnackbarEntry[],
  operationKey: SnackbarEntry["operationKey"],
): SnackbarEntry[] {
  return closeMatching(entries, (entry) => entry.operationKey === operationKey);
}

/**
 * Builds a new open entry with an id nothing else holds.
 * @param message - Error message to show.
 * @param operationKey - Operation the entry reports on.
 * @returns the new entry.
 */
function createEntry(
  message: string,
  operationKey: SnackbarEntry["operationKey"],
): SnackbarEntry {
  return {
    id: `snackbar-entry-${++entryCount}`,
    message,
    open: true,
    operationKey,
  };
}

/**
 * Marks the entries a predicate selects as closed, returning `entries`
 * unchanged when none match so React can bail out of the update. A success
 * dismisses its operation on every request, and the stack is usually empty.
 * @param entries - Current entries.
 * @param isMatch - Selects the entries to close.
 * @returns entries with the matching ones marked closed.
 */
function closeMatching(
  entries: SnackbarEntry[],
  isMatch: (entry: SnackbarEntry) => boolean,
): SnackbarEntry[] {
  if (!entries.some((entry) => entry.open && isMatch(entry))) return entries;
  return entries.map((entry) =>
    isMatch(entry) ? { ...entry, open: false } : entry,
  );
}

/**
 * Appends an error to the stack, or replaces the entry that operation already
 * has showing.
 *
 * One operation holds at most one entry, so a retry updates its entry rather
 * than adding another. The replacement gets a fresh id, which remounts it and
 * so re-announces the message, and keeps its position in the list. Only open
 * entries are matched; one already animating out has been dismissed.
 * @param entries - Current entries.
 * @param message - Error message to show.
 * @param operationKey - Operation the entry reports on.
 * @returns entries with the error added, or that operation's entry replaced.
 */
export function openEntry(
  entries: SnackbarEntry[],
  message: string,
  operationKey: SnackbarEntry["operationKey"],
): SnackbarEntry[] {
  const showing = entries.findIndex(
    (entry) => entry.open && entry.operationKey === operationKey,
  );
  const entry = createEntry(message, operationKey);
  if (showing === -1) return [...entries, entry];
  return entries.map((current, index) => (index === showing ? entry : current));
}

/**
 * Drops an entry once its exit transition has finished.
 * @param entries - Current entries.
 * @param id - Entry to remove.
 * @returns entries without the named one.
 */
export function removeEntry(
  entries: SnackbarEntry[],
  id: SnackbarEntry["id"],
): SnackbarEntry[] {
  return entries.filter((entry) => entry.id !== id);
}
