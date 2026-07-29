import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerListEntrySheetValidation } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { useFetchData } from "@/app/hooks/useFetchData";
import { useMemo } from "react";
import { MetadataEntrySheet } from "../entities";

interface UseFetchEntrySheetsValidations {
  entrySheets?: MetadataEntrySheet[];
}

export const useFetchEntrySheetsValidations = (
  pathParameter: PathParameter,
): UseFetchEntrySheetsValidations => {
  // Validate atlasId - required for API request.
  if (!pathParameter.atlasId) throw new Error("Atlas ID is required");

  const { data } = useFetchData<
    HCAAtlasTrackerListEntrySheetValidation[] | undefined
  >(getRequestURL(API.ATLAS_ENTRY_SHEETS, pathParameter), METHOD.GET);

  // Extract atlasId from pathParameter.
  const { atlasId } = pathParameter;

  // Augment each entry sheet with the current atlasId.
  // This enables in-app routing and ensures atlasId is always present in table cell data.
  const entrySheets = useMemo(
    () => data?.map((entrySheet) => ({ atlasId, ...entrySheet })),
    [atlasId, data],
  );

  return { entrySheets };
};
