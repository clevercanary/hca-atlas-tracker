import Router from "next/router";
import { RouteValue } from "../../../routes/entities";

/**
 * Default navigation.
 * @param path - Path.
 * @param _route - Route (unused).
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- _route is unused.
export function navigateToRoute(path: string, _route?: RouteValue): void {
  Router.push(path);
}
