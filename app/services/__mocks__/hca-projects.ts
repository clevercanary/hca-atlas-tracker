import {
  TEST_HCA_PROJECTS_BY_DOI,
  TEST_HCA_PROJECTS_BY_ID,
} from "../../../testing/constants";
import { getProjectsInfo, ProjectInfo } from "../../utils/hca-projects";
import { RefreshDataResult } from "../common/refresh-service";

export function areProjectsRefreshing(): boolean {
  return false;
}

export function getProjectIdByDoi(
  dois: string[]
): RefreshDataResult<string | null> {
  return getProjectInfoByDoi(dois).mapRefresh((info) => info?.id ?? null);
}

export function getProjectInfoByDoi(
  dois: string[]
): RefreshDataResult<ProjectInfo | null> {
  for (const doi of dois) {
    const projectsResponse = TEST_HCA_PROJECTS_BY_DOI.get(doi);
    if (projectsResponse) {
      return RefreshDataResult.ok(getProjectsInfo(projectsResponse)[0]);
    }
  }
  return RefreshDataResult.ok(null);
}

export function getProjectInfoById(
  id: string
): RefreshDataResult<ProjectInfo | null> {
  const projectsResponse = TEST_HCA_PROJECTS_BY_ID.get(id);
  return RefreshDataResult.ok(
    projectsResponse ? getProjectsInfo(projectsResponse)[0] : null
  );
}
