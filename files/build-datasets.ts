import {
  AzulEntitiesResponse,
  AzulListParams,
  LABEL,
} from "@clevercanary/data-explorer-ui/lib/apis/azul/common/entities";
import { transformFilters } from "@clevercanary/data-explorer-ui/lib/apis/azul/common/filterTransformer";
import { COLLATOR_CASE_INSENSITIVE } from "@clevercanary/data-explorer-ui/lib/common/constants";
import { DataSourceConfig } from "@clevercanary/data-explorer-ui/lib/config/entities";
import { api } from "@clevercanary/data-explorer-ui/lib/entity/common/client";
import { convertUrlParams } from "@clevercanary/data-explorer-ui/lib/utils/url";
import {
  AggregatedCellSuspensionResponse,
  AggregatedDonorOrganismResponse,
  AggregatedFileTypeSummaryResponse,
  AggregatedSampleResponse,
  AggregatedSpecimenResponse,
} from "./entities/aggregatedEntities";
import { ProjectResponse, PublicationResponse } from "./entities/entities";
import { ProjectsResponse } from "./entities/responses";

const API_URL = "https://service.azul.data.humancellatlas.org/index";

const initCellSuspension: AggregatedCellSuspensionResponse = {
  selectedCellType: [],
  totalCells: null,
};

const initDonorOrganism: AggregatedDonorOrganismResponse = {
  biologicalSex: [],
  developmentStage: [],
  disease: [],
  donorCount: 0,
  genusSpecies: [],
};

const initFileTypeSummary: AggregatedFileTypeSummaryResponse = {
  contentDescription: [],
  count: 0,
  fileSource: [],
  format: "",
  isIntermediate: null,
  matrixCellCount: null,
  totalSize: 0,
};

const initProject: ProjectResponse = {
  accessible: true,
  accessions: [],
  contributedAnalyses: {},
  contributors: [],
  estimatedCellCount: null,
  laboratory: [],
  matrices: {},
  projectDescription: "",
  projectId: "",
  projectShortname: "",
  projectTitle: "I am COOL",
  publications: [],
  supplementaryLinks: [],
};

const initSample: AggregatedSampleResponse = {
  id: [],
  sampleEntityType: [],
};

const initSpecimen: AggregatedSpecimenResponse = {
  disease: [],
  id: [],
  organ: [],
  organPart: [],
  preservationMethod: [],
  source: [],
};

const initProjectResponse: ProjectsResponse = {
  cellSuspensions: [initCellSuspension],
  donorOrganisms: [initDonorOrganism],
  fileTypeSummaries: [initFileTypeSummary],
  projects: [initProject],
  protocols: [],
  samples: [initSample],
  specimens: [initSpecimen],
};

const externalDatasetsByAtlasKey = new Map([
  [
    "lung-v1-0",
    [
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
  ],
]);

export async function buildAtlasDatasets(
  atlasKey: string,
  datasetIds: string[]
): Promise<ProjectsResponse[]> {
  const projectsResponses: ProjectsResponse[] = [];
  if (datasetIds.length > 0) {
    const result = await fetchEntitiesFromQuery(
      `${API_URL}/projects`,
      filterProjectId(datasetIds)
    );
    projectsResponses.push(...result.hits);
    const datasets = externalDatasetsByAtlasKey.get(atlasKey);
    if (datasets) {
      projectsResponses.push(...datasets);
      projectsResponses.sort(sortDatasets);
    }
  }
  return projectsResponses;
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
  //catalog: string | undefined,
  //accessToken: string | undefined
): Promise<AzulEntitiesResponse> => {
  //const catalogParam = catalog ? { [AZUL_PARAM.CATALOG]: catalog } : undefined;
  const params = {
    ...getDefaultListParams(),
    /*...catalogParam,*/ ...listParams,
  };
  const response = await fetchEntitiesFromURL(
    `${apiPath}?${convertUrlParams(params)}`
    //accessToken
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
  //accessToken?: string
): Promise<AzulEntitiesResponse> => {
  const res = await api(API_URL).get<AzulEntitiesResponse>(
    URL
    //getAxiosRequestOptions(accessToken)
  );
  return res.data;
};

function getDefaultListParams():
  | DataSourceConfig["defaultListParams"]
  | DataSourceConfig["defaultParams"] {
  return {
    catalog: "dcp34",
    size: "100",
  };
}

/**
 * Returns dataset shaped as projects response.
 * @param disease - Disease.
 * @param estimatedCellCount - Estimated cell count.
 * @param genusSpecies - Genus species.
 * @param libraryConstructionApproach - Library construction approach.
 * @param organ - Organ.
 * @param projectTitle - Project title.
 * @param publication - Publication.
 * @returns projects response.
 */
export function buildDataset(
  disease: string[],
  estimatedCellCount: number,
  genusSpecies: string[],
  libraryConstructionApproach: string[],
  organ: string[],
  projectTitle: string,
  publication?: PublicationResponse
): ProjectsResponse {
  return {
    ...initProjectResponse,
    donorOrganisms: [
      {
        ...initDonorOrganism,
        disease,
        genusSpecies,
      },
    ],
    projects: [
      {
        ...initProject,
        estimatedCellCount,
        projectTitle,
        publications: publication ? [publication] : [],
      },
    ],
    protocols: [{ libraryConstructionApproach }],
    specimens: [{ ...initSpecimen, organ }],
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

/**
 * Type of possible string values returned in a core value from Azul.
 */
type StringOrNull = string | null;

/**
 * Type that is a union of all keys of T that have a type of string or null.
 */
type KeyOfTypeStringOrNull<T> = {
  [K in keyof T]: T[K] extends StringOrNull ? K : never;
}[keyof T];

/**
 * Process the string or null value for the given response value.
 * @param responseValues - Singleton array containing values returned from the backend.
 * @param key - The object key (of a value containing string or null values).
 * @param label - Value to display if value for given key is null. Defaults to "Unspecified".
 * @returns Value in the response with the given key, converted to string if null.
 */
export function processEntityValue<T, K extends KeyOfTypeStringOrNull<T>>(
  responseValues: T[],
  key: K,
  label = LABEL.UNSPECIFIED
): string {
  // Response values should be a singleton array; check for at least one value here.
  if (responseValues.length === 0) {
    return LABEL.ERROR;
  }

  // Grab value from the singleton array for the given key.
  const responseValue = responseValues[0];
  const value = responseValue[key] as unknown as StringOrNull; // TODO revisit type assertion here

  // Sanitize.
  return value ?? label;
}
