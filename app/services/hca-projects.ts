import {
  AzulCatalogResponse,
  AzulEntitiesResponse,
} from "@databiosphere/findable-ui/lib/apis/azul/common/entities";
import { ProjectsResponse } from "../apis/azul/hca-dcp/common/responses";
import { normalizeDoi } from "../utils/doi";
import { makeRefreshService, RefreshInfo } from "./common/refresh-service";

type ProjectIdsByDoi = Map<string, string>;

interface ProjectsData {
  byDoi: ProjectIdsByDoi;
  catalog: string;
}

export type ProjectsInfo = RefreshInfo<ProjectsData>;

const API_URL_CATALOGS =
  "https://service.azul.data.humancellatlas.org/index/catalogs";
const API_URL_PROJECTS =
  "https://service.azul.data.humancellatlas.org/index/projects";

const { getData: getProjectsData } = makeRefreshService({
  getRefreshParams: getLatestCatalog,
  async getRefreshedData(catalog) {
    return {
      byDoi: await getRefreshedProjectIdsByDoi(catalog),
      catalog,
    };
  },
  getStoredInfo() {
    return globalThis.hcaAtlasTrackerProjectsInfoCache;
  },
  notReadyMessage: "DOI to HCA project ID mapping not initialized",
  refreshNeeded(data, catalog) {
    return data?.catalog !== catalog;
  },
  setStoredInfo(info) {
    globalThis.hcaAtlasTrackerProjectsInfoCache = info;
  },
});

/**
 * Get HCA project ID by project DOI, and start a refresh of the DOI-to-ID mappings if needed.
 * @param doi -- DOI to get project ID for.
 * @returns HCA project ID, or null if none is found.
 */
export async function getProjectIdByDoi(doi: string): Promise<string | null> {
  return getProjectsData().byDoi.get(normalizeDoi(doi)) ?? null;
}

/**
 * Fetch the given catalog and build DOI-to-ID mapping.
 * @param catalog - Catalog to fetch projects from.
 * @returns project IDs by DOI for the given catalog.
 */
async function getRefreshedProjectIdsByDoi(
  catalog: string
): Promise<ProjectIdsByDoi> {
  const projectIdsByDoi: ProjectIdsByDoi = new Map();
  const hits = await getAllProjects(catalog);
  for (const projectsResponse of hits) {
    for (const project of projectsResponse.projects) {
      for (const publication of project.publications) {
        if (publication.doi)
          projectIdsByDoi.set(normalizeDoi(publication.doi), project.projectId);
      }
    }
  }
  return projectIdsByDoi;
}

/**
 * Fetch current default HCA catalog name.
 * @returns catalog name.
 */
async function getLatestCatalog(): Promise<string> {
  const catalogs: AzulCatalogResponse = await (
    await fetch(API_URL_CATALOGS)
  ).json();
  return catalogs.default_catalog;
}

/**
 * Fetch all projects from given catalog.
 * @param catalog - Catalog to fetch projects from.
 * @returns projects responses for all of the catalog's projects.
 */
async function getAllProjects(catalog: string): Promise<ProjectsResponse[]> {
  let url:
    | string
    | undefined = `${API_URL_PROJECTS}?catalog=${encodeURIComponent(
    catalog
  )}&size=100`;
  const hits: ProjectsResponse[] = [];
  while (url) {
    const responseData: AzulEntitiesResponse<ProjectsResponse> = await (
      await fetch(url)
    ).json();
    hits.push(...responseData.hits);
    url = responseData.pagination.next;
  }
  return hits;
}
