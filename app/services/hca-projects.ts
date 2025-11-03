import { Options as KyOptions } from "ky";
import { getAllProjects, getLatestCatalog } from "../utils/hca-api";
import { getProjectsInfo, ProjectInfo } from "../utils/hca-projects";
import {
  makeRefreshService,
  RefreshDataResult,
  RefreshInfo,
} from "./common/refresh-service";
import { doUpdatesIfRefreshesComplete } from "./refresh-services";

interface ProjectsData {
  byDoi: Map<string, ProjectInfo>;
  byId: Map<string, ProjectInfo>;
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
  autoStart: process.env.NODE_ENV !== "test",
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
      ...(await getRefreshedProjectIdsByDoi(catalog)),
      catalog,
    };
  },
  getStoredInfo() {
    return globalThis.hcaAtlasTrackerProjectsInfoCache;
  },
  notReadyMessage: "DOI to HCA project ID mapping not initialized",
  onRefreshSuccess() {
    doUpdatesIfRefreshesComplete();
  },
  refreshNeeded(data, { catalog }) {
    return data?.catalog !== catalog;
  },
  setStoredInfo(info) {
    globalThis.hcaAtlasTrackerProjectsInfoCache = info;
  },
});

export const forceProjectsRefresh = refreshService.forceRefresh;

export const getProjectsStatus = refreshService.getStatus;

export const areProjectsRefreshing = refreshService.isRefreshing;

/**
 * Find the first of a list of DOIs that matches an HCA project, and return the project's ID, starting a refresh of the DOI-to-project mappings if needed.
 * @param dois -- Normalized DOIs to check to find a project.
 * @returns HCA project ID, or null if none is found.
 */
export function getProjectIdByDoi(
  dois: string[]
): RefreshDataResult<string | null> {
  return getProjectInfoByDoi(dois).mapRefresh((info) => info?.id ?? null);
}

/**
 * Find the first of a list of DOIs that matches an HCA project, and return the project's info, starting a refresh of the DOI-to-project mappings if needed.
 * @param dois -- Normalized DOIs to check to find a project.
 * @returns HCA project info, or null if none is found.
 */
export function getProjectInfoByDoi(
  dois: string[]
): RefreshDataResult<ProjectInfo | null> {
  return refreshService.getData().mapRefresh(({ byDoi }) => {
    for (const doi of dois) {
      const projectInfo = byDoi.get(doi);
      if (projectInfo !== undefined) return projectInfo;
    }
    return null;
  });
}

/**
 * Get an HCA project's info by project ID, starting a refresh of the DOI-to-project mappings if needed.
 * @param id -- HCA project ID.
 * @returns HCA project info, or null if none is found.
 */
export function getProjectInfoById(
  id: string
): RefreshDataResult<ProjectInfo | null> {
  return refreshService
    .getData()
    .mapRefresh(({ byId }) => byId.get(id) ?? null);
}

/**
 * Fetch the given catalog and build DOI-to-ID mapping.
 * @param catalog - Catalog to fetch projects from.
 * @returns project IDs by DOI for the given catalog.
 */
async function getRefreshedProjectIdsByDoi(
  catalog: string
): Promise<Pick<ProjectsData, "byDoi" | "byId">> {
  const projectsInfoByDoi = new Map<string, ProjectInfo>();
  const projectsInfoById = new Map<string, ProjectInfo>();
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
    for (const projectInfo of getProjectsInfo(projectsResponse)) {
      if (projectInfo.doi) projectsInfoByDoi.set(projectInfo.doi, projectInfo);
      projectsInfoById.set(projectInfo.id, projectInfo);
    }
  }
  return {
    byDoi: projectsInfoByDoi,
    byId: projectsInfoById,
  };
}
