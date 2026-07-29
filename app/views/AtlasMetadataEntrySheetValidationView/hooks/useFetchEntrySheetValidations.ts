import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerEntrySheetValidation } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { useFetchData } from "@/app/hooks/useFetchData";

interface UseFetchEntrySheetValidation {
  entrySheetValidation?: HCAAtlasTrackerEntrySheetValidation;
}

export const useFetchEntrySheetValidation = (
  pathParameter: PathParameter,
): UseFetchEntrySheetValidation => {
  // Validate atlasId and entrySheetValidationId - required for API request.
  if (!pathParameter.atlasId) throw new Error("Atlas ID is required");
  if (!pathParameter.entrySheetValidationId)
    throw new Error("Entry sheet validation ID is required");

  const { data: entrySheetValidation } = useFetchData<
    HCAAtlasTrackerEntrySheetValidation | undefined
  >(getRequestURL(API.ATLAS_ENTRY_SHEET, pathParameter), METHOD.GET);

  return { entrySheetValidation };
};
