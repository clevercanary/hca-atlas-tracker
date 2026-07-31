import { PathParameter } from "@/app/common/entities";
import { getRouteURL } from "@/app/common/utils";
import { useBackPath } from "@/app/components/Layout/components/Detail/components/DetailViewHero/components/BackButton/hooks/UseBackPath/hook";
import { ROUTE } from "@/app/routes/constants";

/**
 * Returns the back-arrow path for an atlas detail tab. Honors an explicit
 * `from` origin when one is provided, otherwise falls back to the Status tab —
 * the atlas's landing page.
 * @param pathParameter - Path parameter (must include atlasId).
 * @returns back path.
 */
export function useAtlasTabBackPath(pathParameter: PathParameter): string {
  return (
    useBackPath(pathParameter) ?? getRouteURL(ROUTE.ATLAS_STATUS, pathParameter)
  );
}
