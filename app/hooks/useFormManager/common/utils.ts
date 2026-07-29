import { RouteValue } from "@/app/routes/entities";
import Router from "next/router";

/**
 * Default navigation.
 * @param path - Path.
 * @param _route - Route (unused).
 */

export function navigateToRoute(path: string, _route?: RouteValue): void {
  Router.push(path);
}
