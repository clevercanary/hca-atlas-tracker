/**
 * Outcome of re-reading the session before a navigation is allowed to destroy
 * page state.
 *
 * Three states rather than a boolean because "not ended" conflates two
 * opposite situations, and the old boolean silently took the wrong branch for
 * one of them:
 * - `ENDED` — the read agreed the session is gone; leaving is warranted.
 * - `LIVE` — the read returned a session, so the client's `null` is
 *   *known-wrong*. The tab cannot right itself from here (next-auth gates its
 *   poll on a non-null session and its focus refetch bails on a null one), so
 *   this is a signal to recover, not to sit still.
 * - `INCONCLUSIVE` — the read itself failed. Nothing was learned, so the page
 *   is held and the read is retried; treating this as terminal is what left a
 *   tab stranded on a single blip.
 */
export const SESSION_CONFIRMATION = {
  ENDED: "ENDED",
  INCONCLUSIVE: "INCONCLUSIVE",
  LIVE: "LIVE",
} as const;

export type SessionConfirmation =
  (typeof SESSION_CONFIRMATION)[keyof typeof SESSION_CONFIRMATION];
