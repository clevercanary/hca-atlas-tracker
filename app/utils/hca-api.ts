import {
  AzulCatalogResponse,
  AzulEntitiesResponse,
} from "@databiosphere/findable-ui/lib/apis/azul/common/entities";
import ky, { Options as KyOptions } from "ky";
import { ProjectsResponse } from "../apis/azul/hca-dcp/common/responses";

const API_URL_CATALOGS =
  "https://service.azul.data.humancellatlas.org/index/catalogs";

const API_URL_PROJECTS =
  "https://service.azul.data.humancellatlas.org/index/projects";

const PROJECTS_PAGE_SIZE = 75;

/**
 * Fetch current default HCA catalog name.
 * @param kyOptions - Options to pass to ky.
 * @returns catalog name.
 */
export async function getLatestCatalog(kyOptions?: KyOptions): Promise<string> {
  const catalogs: AzulCatalogResponse = await ky(
    API_URL_CATALOGS,
    kyOptions
  ).json();
  return catalogs.default_catalog;
}

/**
 * Fetch all projects from given catalog.
 * @param catalog - Catalog to fetch projects from.
 * @param kyOptions - Options to pass to ky.
 * @returns projects responses for all of the catalog's projects.
 */
export async function getAllProjects(
  catalog: string,
  kyOptions?: KyOptions
): Promise<ProjectsResponse[]> {
  let url:
    | string
    | undefined = `${API_URL_PROJECTS}?catalog=${encodeURIComponent(
    catalog
  )}&size=${PROJECTS_PAGE_SIZE}`;
  const hits: ProjectsResponse[] = [];
  while (url) {
    const responseData: AzulEntitiesResponse<ProjectsResponse> = await ky(
      url,
      kyOptions
    ).json();
    hits.push(...responseData.hits);
    url = responseData.pagination.next;
  }
  return hits;
}
