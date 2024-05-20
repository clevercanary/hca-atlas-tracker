import { Options as KyOptions } from "ky";
import { normalizeDoi } from "../utils/doi";
import { getAllProjects, getLatestCatalog } from "../utils/hca-api";
import { makeRefreshService, RefreshInfo } from "./common/refresh-service";
import { isAnyServiceRefreshing } from "./refresh-services";
import { revalidateAllSourceDatasets } from "./validations";

export interface ProjectInfo {
  id: string;
  title: string;
}

type ProjectInfoByDoi = Map<string, ProjectInfo>;

interface ProjectsData {
  byDoi: ProjectInfoByDoi;
  catalog: string;
}

interface ProjectsRefreshParams {
  catalog: string;
  lastCatalogRequestTime: number;
}

export type ProjectsInfo = RefreshInfo<ProjectsData, ProjectsRefreshParams>;

const CATALOG_REQUEST_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours

const KY_OPTIONS: KyOptions = {
  retry: {
    delay: () => 60000,
    limit: 5,
  },
  timeout: 120000,
};

const refreshService = makeRefreshService({
  async getRefreshParams(
    data?: ProjectsData,
    prevRefreshParams?: ProjectsRefreshParams
  ): Promise<ProjectsRefreshParams> {
    if (
      prevRefreshParams &&
      Date.now() - prevRefreshParams.lastCatalogRequestTime <=
        CATALOG_REQUEST_INTERVAL
    ) {
      return prevRefreshParams;
    }
    console.log("Requesting HCA catalog");
    const catalog = await getLatestCatalog({
      hooks: {
        beforeRetry: [
          (): void => {
            console.log("Retrying HCA catalog request");
          },
        ],
      },
      ...KY_OPTIONS,
    });
    console.log("Received HCA catalog");
    return {
      catalog,
      lastCatalogRequestTime: Date.now(),
    };
  },
  async getRefreshedData({ catalog }) {
    return {
      byDoi: await getRefreshedProjectIdsByDoi(catalog),
      catalog,
    };
  },
  getStoredInfo() {
    return globalThis.hcaAtlasTrackerProjectsInfoCache;
  },
  notReadyMessage: "DOI to HCA project ID mapping not initialized",
  onRefreshSuccess() {
    if (!isAnyServiceRefreshing()) revalidateAllSourceDatasets();
  },
  refreshNeeded(data, { catalog }) {
    return data?.catalog !== catalog;
  },
  setStoredInfo(info) {
    globalThis.hcaAtlasTrackerProjectsInfoCache = info;
  },
});

export const areProjectsRefreshing = refreshService.isRefreshing;

/**
 * Find the first of a list of DOIs that matches an HCA project, and return the project's ID, starting a refresh of the DOI-to-project mappings if needed.
 * @param dois -- Normalized DOIs to check to find a project.
 * @returns HCA project ID, or null if none is found.
 */
export function getProjectIdByDoi(dois: string[]): string | null {
  return getProjectInfoByDoi(dois)?.id ?? null;
}

/**
 * Find the first of a list of DOIs that matches an HCA project, and return the project's info, starting a refresh of the DOI-to-project mappings if needed.
 * @param dois -- Normalized DOIs to check to find a project.
 * @returns HCA project info, or null if none is found.
 */
export function getProjectInfoByDoi(dois: string[]): ProjectInfo | null {
  const { byDoi } = refreshService.getData();
  for (const doi of dois) {
    const projectInfo = byDoi.get(doi);
    if (projectInfo !== undefined) return projectInfo;
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
): Promise<ProjectInfoByDoi> {
  const projectIdsByDoi: ProjectInfoByDoi = new Map();
  console.log("Requesting HCA projects");
  const hits = await getAllProjects(catalog, {
    hooks: {
      beforeRetry: [
        (): void => {
          console.log("Retrying HCA projects request");
        },
      ],
    },
    ...KY_OPTIONS,
  });
  console.log("Loaded HCA projects");
  for (const projectsResponse of hits) {
    for (const project of projectsResponse.projects) {
      for (const publication of project.publications) {
        if (publication.doi)
          projectIdsByDoi.set(normalizeDoi(publication.doi), {
            id: project.projectId,
            title: project.projectTitle,
          });
      }
    }
  }
  return projectIdsByDoi;
}
