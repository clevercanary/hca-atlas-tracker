import {
  AzulCatalogResponse,
  AzulEntitiesResponse,
} from "@databiosphere/findable-ui/lib/apis/azul/common/entities";
import { ProjectsResponse } from "../apis/azul/hca-dcp/common/responses";

const API_URL_CATALOGS =
  "https://service.azul.data.humancellatlas.org/index/catalogs";
const API_URL_PROJECTS =
  "https://service.azul.data.humancellatlas.org/index/projects";

/**
 * Fetch current default HCA catalog name.
 * @returns catalog name.
 */
export async function getLatestCatalog(): Promise<string> {
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
export async function getAllProjects(
  catalog: string
): Promise<ProjectsResponse[]> {
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
