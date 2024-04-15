import {
  AzulCatalogResponse,
  AzulEntitiesResponse,
} from "@clevercanary/data-explorer-ui/lib/apis/azul/common/entities";
import { ProjectsResponse } from "../apis/azul/hca-dcp/common/responses";
import { normalizeDoi } from "./publications";

type ProjectIdsByDoi = Map<string, string>;

export interface ProjectsInfo {
  byDoi: ProjectIdsByDoi;
  catalog: string | null;
  initialLoadPromise: Promise<void>;
  refreshing: boolean | null;
}

const API_URL_CATALOGS =
  "https://service.azul.data.humancellatlas.org/index/catalogs";
const API_URL_PROJECTS =
  "https://service.azul.data.humancellatlas.org/index/projects";

const projectsInfo = getProjectsInfo();

export async function getProjectIdByDoi(doi: string): Promise<string | null> {
  await projectsInfo.initialLoadPromise;
  startRefreshIfNeeded();
  return projectsInfo.byDoi.get(normalizeDoi(doi)) ?? null;
}

async function startRefreshIfNeeded(force = false): Promise<void> {
  let catalog: string;
  try {
    catalog = await getLatestCatalog();
  } catch (e) {
    console.error(e);
    return;
  }
  if (force || (!projectsInfo.refreshing && projectsInfo.catalog !== catalog)) {
    projectsInfo.refreshing = true;
    try {
      projectsInfo.byDoi = await getRefreshedProjectIdsByDoi(catalog);
      projectsInfo.catalog = catalog;
    } catch (e) {
      console.error(e);
    } finally {
      projectsInfo.refreshing = false;
    }
  }
}

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

async function getLatestCatalog(): Promise<string> {
  const catalogs: AzulCatalogResponse = await (
    await fetch(API_URL_CATALOGS)
  ).json();
  return catalogs.default_catalog;
}

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
 * Gets projects info stored on the global object, creating it and starting a refresh if it doesn't already exist.
 * @returns projects info.
 */
function getProjectsInfo(): ProjectsInfo {
  return (
    globalThis.hcaAtlasTrackerProjectsInfoCache ||
    (globalThis.hcaAtlasTrackerProjectsInfoCache = {
      byDoi: new Map(),
      catalog: null,
      initialLoadPromise: startRefreshIfNeeded(true),
      refreshing: null,
    })
  );
}
