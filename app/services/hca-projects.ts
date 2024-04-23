import { normalizeDoi } from "../utils/doi";
import { getAllProjects, getLatestCatalog } from "../utils/hca-api";
import { makeRefreshService, RefreshInfo } from "./common/refresh-service";

type ProjectIdsByDoi = Map<string, string>;

interface ProjectsData {
  byDoi: ProjectIdsByDoi;
  catalog: string;
}

export type ProjectsInfo = RefreshInfo<ProjectsData>;

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
 * Find the first of a list of DOIs that matches an HCA project, and return the project's ID, starting a refresh of the DOI-to-ID mappings if needed.
 * @param dois -- DOIs to check to find a project ID.
 * @returns HCA project ID, or null if none is found.
 */
export function getProjectIdByDoi(dois: string[]): string | null {
  const { byDoi } = getProjectsData();
  for (const doi of dois) {
    const projectId = byDoi.get(normalizeDoi(doi));
    if (projectId !== undefined) return projectId;
  }
  return null;
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
