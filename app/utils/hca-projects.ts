import {
  AzulCatalogResponse,
  AzulEntitiesResponse,
} from "@clevercanary/data-explorer-ui/lib/apis/azul/common/entities";
import { fetchAllEntities } from "@clevercanary/data-explorer-ui/lib/entity/api/service";
import { ProjectsResponse } from "../apis/azul/hca-dcp/common/responses";
import { normalizeDoi } from "./publications";

type ProjectIdsByDoi = Map<string, string>;

interface RefreshState {
  projectIdsByDoiCatalog: string;
  projectIdsByDoiPromise: Promise<ProjectIdsByDoi>;
  projectsRefreshing: boolean;
}

const API_URL_CATALOGS =
  "https://service.azul.data.humancellatlas.org/index/catalogs";
const API_URL_PROJECTS =
  "https://service.azul.data.humancellatlas.org/index/projects";

let refreshState: RefreshState | null = null;

export async function getProjectIdByDoi(doi: string): Promise<string | null> {
  return (await getLatestProjectIdsByDoi()).get(normalizeDoi(doi)) ?? null;
}

async function getLatestProjectIdsByDoi(): Promise<ProjectIdsByDoi> {
  const catalog = await getLatestCatalog();
  if (
    !refreshState?.projectsRefreshing &&
    (refreshState === null || refreshState.projectIdsByDoiCatalog !== catalog)
  ) {
    const newPromise = getRefreshedProjectIdsByDoi(catalog);
    const newRefreshState = {
      projectIdsByDoiCatalog: catalog,
      projectIdsByDoiPromise: newPromise,
      projectsRefreshing: true,
    };
    const prevRefreshState = refreshState;
    refreshState = newRefreshState;
    newPromise
      .then(() => {
        newRefreshState.projectsRefreshing = false;
      })
      .catch(() => {
        refreshState = prevRefreshState;
      });
  }
  return refreshState.projectIdsByDoiPromise;
}

async function getRefreshedProjectIdsByDoi(
  catalog: string
): Promise<ProjectIdsByDoi> {
  const projectIdsByDoi: ProjectIdsByDoi = new Map();
  const entitiesResponse: AzulEntitiesResponse<ProjectsResponse> =
    await fetchAllEntities(API_URL_PROJECTS, undefined, catalog);
  for (const projectsResponse of entitiesResponse.hits) {
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
