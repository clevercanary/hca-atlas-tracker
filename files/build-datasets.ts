import {
  AzulEntitiesResponse,
  AzulListParams,
} from "@clevercanary/data-explorer-ui/lib/apis/azul/common/entities";
import { transformFilters } from "@clevercanary/data-explorer-ui/lib/apis/azul/common/filterTransformer";
import { COLLATOR_CASE_INSENSITIVE } from "@clevercanary/data-explorer-ui/lib/common/constants";
import { DataSourceConfig } from "@clevercanary/data-explorer-ui/lib/config/entities";
import { api } from "@clevercanary/data-explorer-ui/lib/entity/common/client";
import { convertUrlParams } from "@clevercanary/data-explorer-ui/lib/utils/url";
import { HCAAtlasTrackerSourceDataset } from "app/apis/catalog/hca-atlas-tracker/common/entities";
import { ProjectResponse } from "./apis/azul/entities";
import { ProjectsResponse } from "./apis/azul/responses";
import {
  processAggregatedOrArrayValue,
  processEntityValue,
} from "./apis/azul/utils";
import { buildDataset } from "./apis/datasets";
import { DATA_SOURCE } from "./constants";

interface AtlasDatasetsInfo {
  datasetIds: string[];
  externalDatasets: ProjectsResponse[];
}

const datasetsByAtlasKey = new Map<string, AtlasDatasetsInfo>([
  [
    "lung-v1-0",
    {
      datasetIds: [
        "01aacb68-4076-4fd9-9eb9-aba0f48c1b5a",
        "08fb10df-32e5-456c-9882-e33fcd49077a",
        "1538d572-bcb7-426b-8d2c-84f3a7f87bb0",
        "1c4cbdd4-33e3-4ded-ab43-5958de817123",
        "272b7602-66cd-4b02-a86b-2b7c9c51a9ea",
        "2f676143-80c2-4bc6-b7b4-2613fe0fadf0",
        "326b36bd-0975-475f-983b-56ddb8f73a4d",
        "34c9a62c-a610-4e31-b343-8fb7be676f8c",
        "453d7ee2-319f-496c-9862-99d397870b63",
        "457d0bfe-79e4-43f1-be5d-83bf080d809e",
        "4a95101c-9ffc-4f30-a809-f04518a23803",
        "58028aa8-0ed2-49ca-b60f-15e2ed5989d5",
        "5a54c617-0eed-486e-8c1a-8a8041fc1729",
        "61515820-5bb8-45d0-8d12-f0850222ecf0",
        "65cbfea5-5c54-4255-a1d0-14549a86a5c1",
        "6936da41-3692-46bb-bca1-cd0f507991e9",
        "92892ab2-1334-4b1c-9761-14f5a73548ea",
        "957261f7-2bd6-4358-a6ed-24ee080d5cfc",
        "b91c623b-1945-4727-b167-0a93027b0d3f",
        "bc5512cc-9544-4aa4-8b75-8af445ee2257",
        "c0518445-3b3b-49c6-b8fc-c41daa4eacba",
        "c16a754f-5da3-46ed-8c1e-6426af2ef625",
        "c1a9a93d-d9de-4e65-9619-a9cec1052eaa",
        "c4077b3c-5c98-4d26-a614-246d12c2e5d7",
        "daf9d982-7ce6-43f6-ab51-272577290606",
        "e526d91d-cf3a-44cb-80c5-fd7676b55a1d",
        "e5fe8274-3769-4d7d-aa35-6d33c226ab43",
        "ef1e3497-515e-4bbe-8d4c-10161854b699",
        "6735ff73-1a04-422e-b500-730202e46f8a",
      ],
      externalDatasets: [
        // Study name: Jain_Misharin_2021.
        buildDataset(
          ["Normal"],
          45557,
          ["TODO"],
          ["10X 5' v1", "v2"],
          ["TODO"],
          "Expansion of profibrotic monocyte-derived alveolar macrophages in patients with persistent respiratory symptoms and radiographic abnormalities after COVID-19",
          {
            doi: "10.1101/2023.07.30.551145",
            officialHcaPublication: null,
            publicationTitle:
              "Expansion of profibrotic monocyte-derived alveolar macrophages in patients with persistent respiratory symptoms and radiographic abnormalities after COVID-19",
            publicationUrl:
              "https://www.biorxiv.org/content/10.1101/2023.07.30.551145v1",
          }
        ),
        // Study name: Barbry_unpubl.
        buildDataset(
          ["IPF"],
          100211,
          ["TODO"],
          ["10X 3' v3"],
          ["TODO"],
          "Barbry_unpubl"
        ),
        // Study name:Duong_lungMAP_unpubl.
        buildDataset(
          ["Normal"],
          53904,
          ["TODO"],
          ["10X 3' v3"],
          ["TODO"],
          "Duong_lungMAP_unpubl"
        ),
        // Study name: Schiller_2021.
        buildDataset(
          ["Cancer (non-cancerous tissue used for samples)"],
          35984,
          ["TODO"],
          ["10X 3' v3"],
          ["TODO"],
          "Schiller_2021"
        ),
        // Study name: Schultze_unpubl.
        buildDataset(
          ["Cancer (non-cancerous tissue used for samples)"],
          8016,
          ["TODO"],
          ["Seq-Well"],
          ["TODO"],
          "Schultze_unpubl"
        ),
      ],
    },
  ],
]);

export async function buildAtlasDatasets(
  atlasKey: string
): Promise<HCAAtlasTrackerSourceDataset[]> {
  const projectsResponses: ProjectsResponse[] = [];
  const datasetsInfo = datasetsByAtlasKey.get(atlasKey);
  if (datasetsInfo) {
    const { datasetIds, externalDatasets } = datasetsInfo;
    if (datasetIds.length > 0) {
      const result = await fetchEntitiesFromQuery(
        `${DATA_SOURCE.url}/projects`,
        filterProjectId(datasetIds)
      );
      projectsResponses.push(...result.hits);
      if (externalDatasets) {
        projectsResponses.push(...externalDatasets);
        projectsResponses.sort(sortDatasets);
      }
    }
  }
  return projectsResponses.map((projectsResponse) => ({
    anatomicalEntity: processAggregatedOrArrayValue(
      projectsResponse.specimens,
      "organ"
    ),
    donorDisease: processAggregatedOrArrayValue(
      projectsResponse.donorOrganisms,
      "disease"
    ),
    estimatedCellCount: calculateEstimatedCellCount(projectsResponse),
    libraryConstructionMethod: processAggregatedOrArrayValue(
      projectsResponse.protocols,
      "libraryConstructionApproach"
    ),
    projectId:
      processEntityValue(projectsResponse.projects, "projectId") || null,
    projectTitle: processEntityValue(projectsResponse.projects, "projectTitle"),
    publicationUrl:
      getProjectResponse(projectsResponse).publications[0]?.publicationUrl ||
      null,
    species: processAggregatedOrArrayValue(
      projectsResponse.donorOrganisms,
      "genusSpecies"
    ),
  }));
}

/**
 * Calculate the estimated cell count from the given projects response.
 * Returns the estimated cell count, if any, otherwise the totalCell value from cellSuspensions.
 * @param projectsResponse - Response model return from projects API.
 * @returns estimated cell count.
 */
function calculateEstimatedCellCount(
  projectsResponse: ProjectsResponse
): number | null {
  const estimatedCellCount =
    getProjectResponse(projectsResponse).estimatedCellCount;
  // If there's an estimated cell count for the project, return it as the cell count.
  if (estimatedCellCount) {
    return estimatedCellCount;
  }
  // Otherwise, return the cell suspension total count.
  return rollUpTotalCells(projectsResponse);
}

/**
 * Returns the aggregated total cells from cellSuspensions for the given entity response.
 * @param entityResponse - Response model return from entity API.
 * @returns total cells from cellSuspensions.
 */
function rollUpTotalCells(entityResponse: ProjectsResponse): number | null {
  return entityResponse.cellSuspensions.reduce((acc, { totalCells }) => {
    if (totalCells) {
      acc = (acc ?? 0) + totalCells;
    }
    return acc;
  }, null as null | number);
}

/**
 * Returns the project value from the projects API response.
 * @param projectsResponse - Response returned from projects API response.
 * @returns The core project value from the API response.
 */
export function getProjectResponse(
  projectsResponse: ProjectsResponse
): ProjectResponse {
  return projectsResponse.projects[0];
}

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

/**
 * Sort datasets by project title, ascending.
 * @param d0 - First dataset to compare.
 * @param d1 - Second dataset to compare.
 * @returns Number indicating sort precedence of d0 vs d1.
 */
function sortDatasets(d0: ProjectsResponse, d1: ProjectsResponse): number {
  return COLLATOR_CASE_INSENSITIVE.compare(
    processEntityValue(d0.projects, "projectTitle"),
    processEntityValue(d1.projects, "projectTitle")
  );
}

export const filterProjectId = (value: string[]): AzulListParams => {
  return {
    filters: transformFilters([
      {
        categoryKey: "projectId",
        value,
      },
    ]),
  };
};
