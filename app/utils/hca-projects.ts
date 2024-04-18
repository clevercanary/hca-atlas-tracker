import {
  AzulCatalogResponse,
  AzulEntitiesResponse,
} from "@databiosphere/findable-ui/lib/apis/azul/common/entities";
import { ProjectsResponse } from "../apis/azul/hca-dcp/common/responses";
import { normalizeDoi } from "./publications";

type ProjectIdsByDoi = Map<string, string>;

export interface ProjectsInfo {
  byDoi: ProjectIdsByDoi | null;
  catalog: string | null;
  refreshing: boolean | null;
}

export class ProjectsNotReadyError extends Error {
  constructor(message: string) {
    super(message);
  }
}

const API_URL_CATALOGS =
  "https://service.azul.data.humancellatlas.org/index/catalogs";
const API_URL_PROJECTS =
  "https://service.azul.data.humancellatlas.org/index/projects";

let projectsInfo: ProjectsInfo;
initProjectsInfo();

/**
 * Get HCA project ID by project DOI, and start a refresh of the DOI-to-ID mappings if needed.
 * @param doi -- DOI to get project ID for.
 * @returns HCA project ID, or null if none is found.
 */
export async function getProjectIdByDoi(doi: string): Promise<string | null> {
  startRefreshIfNeeded();
  if (!projectsInfo.byDoi)
    throw new ProjectsNotReadyError(
      "DOI to HCA project ID mapping not initialized"
    );
  return projectsInfo.byDoi.get(normalizeDoi(doi)) ?? null;
}

/**
 * Start a refresh of the DOI-to-ID mappings if the current ones are out of date and not currently refreshing, or if the `force` argument is true.
 * @param force -- Whether to override the condition and force a refresh to happen.
 */
async function startRefreshIfNeeded(force = false): Promise<void> {
  const catalog = await getLatestCatalog();
  if (force || (!projectsInfo.refreshing && projectsInfo.catalog !== catalog)) {
    projectsInfo.refreshing = true;
    try {
      projectsInfo.byDoi = await getRefreshedProjectIdsByDoi(catalog);
      projectsInfo.catalog = catalog;
    } finally {
      projectsInfo.refreshing = false;
    }
  }
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

/**
 * Set `projectsInfo` variable to info object stored on the global object, creating it and starting a refresh if it doesn't already exist.
 */
function initProjectsInfo(): void {
  if (!globalThis.hcaAtlasTrackerProjectsInfoCache) {
    projectsInfo = globalThis.hcaAtlasTrackerProjectsInfoCache = {
      byDoi: null,
      catalog: null,
      refreshing: null,
    };
    startRefreshIfNeeded(true);
  } else {
    projectsInfo = globalThis.hcaAtlasTrackerProjectsInfoCache;
  }
}
