import { Breadcrumb } from "@clevercanary/data-explorer-ui/lib/components/common/Breadcrumbs/breadcrumbs";
import { AtlasId } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { getRouteURL } from "../../../common/utils";
import { ROUTE } from "../../../routes/constants";

/**
 * Returns the breadcrumbs for the create source dataset view.
 * @param atlasId - Atlas ID.
 * @param atlasName - Atlas name.
 * @returns breadcrumbs.
 */
export function getBreadcrumbs(
  atlasId: AtlasId,
  atlasName?: string
): Breadcrumb[] {
  return [
    {
      path: ROUTE.ATLASES,
      text: "Atlases",
    },
    {
      path: getRouteURL(ROUTE.EDIT_ATLAS, atlasId),
      text: atlasName || "Edit Atlas",
    },
    {
      path: "",
      text: "Add Source Dataset",
    },
  ];
}
