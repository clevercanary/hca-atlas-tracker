import { getRouteURL } from "../../../../../../../../../../common/utils";
import { ROUTE } from "../../../../../../../../../../routes/constants";
import { BackOrigin } from "../../constants";
import { ResolveBackPathInput } from "./entities";

/**
 * Resolves the back-arrow path for a detail view from the `from` query
 * captured at first render.
 * If `origin` is a known `ROUTE` key, returns the route URL with the current
 * path parameter substituted. Otherwise (deep link / direct entry) returns
 * `undefined`, letting `BackButton` fall through to its URL-segment trim.
 * @param input - Resolve-back-path input.
 * @param input.origin - Back origin captured from `query.from`.
 * @param input.pathParameter - Path parameter for route substitution.
 * @returns Resolved back path, or undefined to fall through to `BackButton`'s default.
 */
export function resolveBackPath({
  origin,
  pathParameter,
}: ResolveBackPathInput): string | undefined {
  if (!origin) return undefined;
  try {
    return getRouteURL(ROUTE[origin], pathParameter);
  } catch {
    // `getRouteURL` throws if the route template has dynamic segments that
    // aren't satisfied by the current pathParameter (e.g. a sub-list route
    // referenced from a detail page that doesn't carry the sub-list's
    // parent id). Fall through so `BackButton`'s URL-segment trim runs.
    return undefined;
  }
}

/**
 * Parses an unknown `from` query value into a known back-origin (a `ROUTE`
 * key), or `undefined` if the value isn't a recognised key.
 * @param value - Raw `from` query value (from `useRouter().query.from`).
 * @returns Recognised back origin or undefined.
 */
export function parseBackOrigin(value: unknown): BackOrigin | undefined {
  // Use `hasOwnProperty` (not the `in` operator) to reject inherited keys
  // like `__proto__` / `toString` that arrive from untrusted router query.
  if (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(ROUTE, value)
  ) {
    return value as BackOrigin;
  }
  return undefined;
}
