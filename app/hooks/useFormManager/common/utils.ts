import Router from "next/router";

/**
 * Default navigation.
 * @param url - URL.
 */
export function navigateToRoute(url: string): void {
  Router.push(url);
}
