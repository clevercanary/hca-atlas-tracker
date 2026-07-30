import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { PathParameter } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { MetadataEntrySheet } from "@/app/views/AtlasMetadataEntrySheetsView/entities";
import { DefaultError, UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "./query/useQuery";

/**
 * Fetches the atlas's entry sheet validations for the given path parameter via
 * React Query. Read-only — no mutation invalidates it.
 * @param pathParameter - Path parameter (atlas ID).
 * @returns React Query result for the entry sheets list (`data` is the mapped list).
 */
export const useFetchEntrySheetsValidations = (
  pathParameter: PathParameter,
): UseQueryResult<MetadataEntrySheet[], DefaultError> => {
  return useQuery(
    pathParameter.atlasId,
    getRequestURL(API.ATLAS_ENTRY_SHEETS, pathParameter),
  );
};
