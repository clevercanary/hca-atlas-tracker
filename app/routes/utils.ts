import { ROUTE } from "./constants";
import { RouteValue } from "./entities";

/**
 * Returns true if the route is a valid route value.
 * @param route - Route.
 * @returns true if the route is a valid route value.
 */
export function isRouteValue(route: string | RouteValue): route is RouteValue {
  return (Object.values(ROUTE) as string[]).includes(route);
}
