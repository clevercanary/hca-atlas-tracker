import { useRouter } from "next/router";
import { useState } from "react";
import { PathParameter } from "../../../../../../../../../../common/entities";
import { parseBackOrigin, resolveBackPath } from "./utils";

/**
 * Captures the back-arrow origin from `useRouter().query.from` once at first
 * render and resolves the back path for the current detail view. The snapshot
 * survives tab navigation (captured once at mount via a lazy state
 * initializer) so a tab switch within the detail view doesn't repoint the
 * back arrow.
 * @param pathParameter - Path parameter of the current detail view.
 * @returns Resolved back path, or undefined for deep links / direct entry
 *   (in which case `BackButton` falls back to its URL-segment trim).
 */
export function useBackPath(pathParameter: PathParameter): string | undefined {
  const { query } = useRouter();
  const { from } = query;
  const [origin] = useState(() => parseBackOrigin(from));

  return resolveBackPath({ origin, pathParameter });
}
