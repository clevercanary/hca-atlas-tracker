import {
  AzulEntitiesResponse,
  AzulListParams,
} from "@clevercanary/data-explorer-ui/lib/apis/azul/common/entities";
import { DataSourceConfig } from "@clevercanary/data-explorer-ui/lib/config/entities";
import { api } from "@clevercanary/data-explorer-ui/lib/entity/common/client";
import { convertUrlParams } from "@clevercanary/data-explorer-ui/lib/utils/url";
import { DATA_SOURCE } from "files/constants";

/**
 * Make a GET or POST request for a list of entities
 * @param apiPath - Path that will be used to compose the API url
 * @param listParams - Params to be used on the request. If none passed, it will default to page's size 25 and the current catalog version
 * @returns @see ListResponseType
 */
export const fetchEntitiesFromQuery = async (
  apiPath: string,
  listParams: AzulListParams
): Promise<AzulEntitiesResponse> => {
  const params = {
    ...getDefaultListParams(),
    ...listParams,
  };
  const response = await fetchEntitiesFromURL(
    `${apiPath}?${convertUrlParams(params)}`
  );
  response.apiPath = apiPath;
  return response;
};

/**
 * Recursively call the endpoint to get a list of entities. This will iterate over the entity list until the next entity comes null
 * @param apiPath - Path that will be used to compose the API url
 * @returns @see ListResponseType
 */
export const fetchAllEntities = async (
  apiPath: string
): Promise<AzulEntitiesResponse> => {
  const listParams = {};
  const result = await fetchEntitiesFromQuery(apiPath, listParams);
  let hits = result.hits;
  let nextPage = result.pagination.next;
  while (nextPage) {
    const { data: nextPageJson } = await api(
      DATA_SOURCE.url
    ).get<AzulEntitiesResponse>(nextPage);
    nextPage = nextPageJson.pagination.next;
    hits = [...hits, ...nextPageJson.hits];
  }
  return { ...result, hits } as AzulEntitiesResponse;
};

/**
 * Fetch entities from the given URL.
 * @param URL - URL.
 * @returns entities.
 */
export const fetchEntitiesFromURL = async (
  URL: string
): Promise<AzulEntitiesResponse> => {
  const res = await api(DATA_SOURCE.url).get<AzulEntitiesResponse>(URL);
  return res.data;
};

function getDefaultListParams():
  | DataSourceConfig["defaultListParams"]
  | DataSourceConfig["defaultParams"] {
  return {
    ...DATA_SOURCE.defaultListParams,
    ...DATA_SOURCE.defaultParams,
  };
}
