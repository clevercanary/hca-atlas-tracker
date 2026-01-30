import { useRouter } from "next/router";
import type { ParsedUrlQuery } from "querystring";
import { useMemo } from "react";
import {
  HCAAtlasTrackerActiveUser,
  ROLE,
} from "../../apis/catalog/hca-atlas-tracker/common/entities";
import { isRouteValue } from "../../routes/utils";
import { useAuthorization } from "../useAuthorization";
import { ROUTES } from "./common/constants";

export interface UseUserHasEditAuthorization {
  canEdit: boolean;
}

/**
 * Hook facilitating user authorization for editing forms.
 * User is authorized to edit the form if:
 * - User's role is CONTENT_ADMIN, or
 * - User's role is INTEGRATION_LEAD, and
 * - Route is on the accepted list, and
 * - Query matches user's associated resource ids.
 */

export const useUserHasEditAuthorization = (): UseUserHasEditAuthorization => {
  const { user } = useAuthorization();
  const { query, route } = useRouter();
  const canEdit = useMemo(
    () => isUserAuthorizedToEditForms(route, query, user),
    [query, route, user],
  );
  return { canEdit };
};

/**
 * Returns true if the user is authorized to edit forms.
 * @param route - Route.
 * @param query - Query.
 * @param user - User.
 * @returns true if the user is authorized to edit forms.
 */
function isUserAuthorizedToEditForms(
  route: string,
  query: ParsedUrlQuery,
  user?: HCAAtlasTrackerActiveUser,
): boolean {
  if (!user) return false;
  if (isUserContentAdmin(user)) return true;
  if (isUserIntegrationLead(user) && isRouteAccepted(route)) {
    return isQueryAccepted(query, user);
  }
  return false;
}

/**
 * Returns true if the route's query matches the user's associated resource ids.
 * @param query - Query.
 * @param user - User.
 * @returns true if the route's query matches the user's associated resource ids.
 */
function isQueryAccepted(
  query: ParsedUrlQuery,
  user: HCAAtlasTrackerActiveUser,
): boolean {
  for (const queryValue of Object.values(query)) {
    if (!queryValue) continue;
    if (
      typeof queryValue === "string" &&
      user.roleAssociatedResourceIds.includes(queryValue)
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Returns true if the route is an accepted route for possible integration lead editing.
 * @param route - Route.
 * @returns true if the route is an accepted route.
 */
function isRouteAccepted(route: string): boolean {
  return isRouteValue(route) && ROUTES.includes(route);
}

/**
 * Returns true if the user is a content admin.
 * @param user - User.
 * @returns true if the user is a content admin.
 */
function isUserContentAdmin(user: HCAAtlasTrackerActiveUser): boolean {
  return user.role === ROLE.CONTENT_ADMIN;
}

/**
 * Returns true if the user is an integration lead.
 * @param user - User.
 * @returns true if the user is an integration lead.
 */
function isUserIntegrationLead(user: HCAAtlasTrackerActiveUser): boolean {
  return user.role === ROLE.INTEGRATION_LEAD;
}
