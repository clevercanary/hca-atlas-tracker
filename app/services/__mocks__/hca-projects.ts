import {
  TEST_HCA_PROJECTS_BY_DOI,
  TEST_HCA_PROJECTS_BY_ID,
} from "../../../testing/constants";
import { getProjectsInfo, ProjectInfo } from "../../utils/hca-projects";
import { RefreshDataOption } from "../common/refresh-service";

export function areProjectsRefreshing(): boolean {
  return false;
}

export function getProjectIdByDoi(
  dois: string[]
): RefreshDataOption<string | null> {
  return getProjectInfoByDoi(dois).mapRefresh((info) => info?.id ?? null);
}

export function getProjectInfoByDoi(
  dois: string[]
): RefreshDataOption<ProjectInfo | null> {
  for (const doi of dois) {
    const projectsResponse = TEST_HCA_PROJECTS_BY_DOI.get(doi);
    if (projectsResponse) {
      return RefreshDataOption.some(getProjectsInfo(projectsResponse)[0]);
    }
  }
  return RefreshDataOption.some(null);
}

export function getProjectInfoById(
  id: string
): RefreshDataOption<ProjectInfo | null> {
  const projectsResponse = TEST_HCA_PROJECTS_BY_ID.get(id);
  return RefreshDataOption.some(
    projectsResponse ? getProjectsInfo(projectsResponse)[0] : null
  );
}
