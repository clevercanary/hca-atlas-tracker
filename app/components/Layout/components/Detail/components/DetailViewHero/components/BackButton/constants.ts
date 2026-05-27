import { RouteKey } from "../../../../../../../../routes/entities";

/**
 * A back-arrow origin is a `ROUTE` key naming the list (global or atlas-
 * scoped) that the user came from. The detail page resolves the back URL by
 * looking up `ROUTE[origin]` and substituting the current path parameters.
 */
export type BackOrigin = RouteKey;
