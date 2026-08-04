import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { type HCAAtlasTrackerEntrySheetValidation } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type PathParameter } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { type DefaultError, type UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "./query/useQuery";

/**
 * Fetches the entry sheet validation for the given path parameter via React
 * Query. Read-only — no mutation invalidates it.
 * @param pathParameter - Path parameter (atlas ID and entry sheet validation ID).
 * @returns React Query result for the entry sheet validation (`data` is the validation).
 */
export const useFetchEntrySheetValidation = (
  pathParameter: PathParameter,
): UseQueryResult<HCAAtlasTrackerEntrySheetValidation, DefaultError> => {
  return useQuery(
    pathParameter.atlasId,
    pathParameter.entrySheetValidationId,
    getRequestURL(API.ATLAS_ENTRY_SHEET, pathParameter),
  );
};
