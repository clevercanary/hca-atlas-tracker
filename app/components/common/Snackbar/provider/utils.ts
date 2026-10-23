import { SNACKBAR_SEVERITY } from "./constants";
import {
  type ErrorSnackbarEntry,
  type SnackbarEntry,
  type SuccessSnackbarEntry,
} from "./types";

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
 * Marks the entries a predicate selects as closed, returning `entries`
 * unchanged when none match so React can bail out of the update. Every
 * request the server accepts dismisses its operation, and the stack is usually
 * empty.
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
 * Starts the exit transition for the error one operation raised, leaving every
 * other entry alone.
 * @param entries - Current entries.
 * @param operationKey - Operation whose entry to close.
 * @returns entries with that operation's entry marked closed.
 */
export function closeOperation(
  entries: SnackbarEntry[],
  operationKey: ErrorSnackbarEntry["operationKey"],
): SnackbarEntry[] {
  return closeMatching(entries, (entry) =>
    isOperationEntry(entry, operationKey),
  );
}

/**
 * Builds a new open error entry with an id nothing else holds.
 *
 * Advances a module-level counter, so call it from an event handler rather than
 * from inside a `setState` updater — see `onOpen` in `provider.tsx`.
 * @param message - Error message to show.
 * @param operationKey - Operation the entry reports on.
 * @returns the new entry.
 */
export function createErrorEntry(
  message: string,
  operationKey: ErrorSnackbarEntry["operationKey"],
): ErrorSnackbarEntry {
  return {
    id: getEntryId(),
    message,
    open: true,
    operationKey,
    severity: SNACKBAR_SEVERITY.ERROR,
  };
}

/**
 * Builds a new open success entry with an id nothing else holds. Advances the
 * same counter as `createErrorEntry`, so the same caveat applies.
 * @param message - Confirmation to show.
 * @returns the new entry.
 */
export function createSuccessEntry(message: string): SuccessSnackbarEntry {
  return {
    id: getEntryId(),
    message,
    open: true,
    severity: SNACKBAR_SEVERITY.SUCCESS,
  };
}

/**
 * Mints the next entry id.
 * @returns an id nothing else on the page holds.
 */
function getEntryId(): SnackbarEntry["id"] {
  return `snackbar-entry-${++entryCount}`;
}

/**
 * Whether an entry is the error a given operation raised.
 * @param entry - Entry to test.
 * @param operationKey - Operation to match.
 * @returns true when the entry is that operation's error.
 */
function isOperationEntry(
  entry: SnackbarEntry,
  operationKey: ErrorSnackbarEntry["operationKey"],
): boolean {
  return (
    entry.severity === SNACKBAR_SEVERITY.ERROR &&
    entry.operationKey === operationKey
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
 * @param entry - Entry to add, built by `createErrorEntry`.
 * @returns entries with the error added, or that operation's entry replaced.
 */
export function openEntry(
  entries: SnackbarEntry[],
  entry: ErrorSnackbarEntry,
): SnackbarEntry[] {
  const showing = entries.findIndex(
    (current) => current.open && isOperationEntry(current, entry.operationKey),
  );
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
