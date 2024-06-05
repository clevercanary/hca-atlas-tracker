import { useRouter } from "next/router";
import { Fragment } from "react";
import { ROUTE } from "../../../../../../../../../routes/constants";
import { RouteValue } from "../../../../../../../../../routes/entities";

interface PopupContentProps {
  nextRoute?: RouteValue;
}

export const PopupContent = ({ nextRoute }: PopupContentProps): JSX.Element => {
  const { route } = useRouter();
  return (
    <div>
      You have unsaved changes in the {renderText(route as RouteValue)}.{" "}
      {nextRoute && (
        <Fragment>
          Please save your changes before moving to the {renderText(nextRoute)}.
        </Fragment>
      )}
    </div>
  );
};

/**
 * Returns corresponding text "name" + "page" or "tab" for the given route.
 * @param route - Route.
 * @returns text.
 */
export function renderText(route?: RouteValue): string {
  switch (route) {
    case ROUTE.ATLAS:
      return `"Overview" tab`;
    case ROUTE.ATLASES:
      return `"Atlases" page`;
    case ROUTE.CREATE_ATLAS:
      return `"Add New Atlas" page`;
    case ROUTE.CREATE_SOURCE_STUDY:
      return `"Add Source Study" page`;
    case ROUTE.SOURCE_STUDY:
      return `"Source Study" page`;
    case ROUTE.SOURCE_STUDIES:
      return `"Source Studies" tab`;
    default:
      return "";
  }
}
