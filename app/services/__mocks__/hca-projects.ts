import {
  TEST_HCA_PROJECTS_BY_DOI,
  TEST_HCA_PROJECTS_BY_ID,
  TEST_HCA_PROJECTS_WITH_UNAVAILABLE_SERVICE,
} from "../../../testing/constants";
import { ProjectsResponse } from "../../apis/azul/hca-dcp/common/responses";
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
      return testProjectsResponseToResult(projectsResponse);
    }
  }
  return RefreshDataResult.ok(null);
}

export function getProjectInfoById(
  id: string
): RefreshDataResult<ProjectInfo | null> {
  const projectsResponse = TEST_HCA_PROJECTS_BY_ID.get(id);
  if (!projectsResponse) return RefreshDataResult.ok(null);
  return testProjectsResponseToResult(projectsResponse);
}

function testProjectsResponseToResult(
  projectsResponse: ProjectsResponse
): RefreshDataResult<ProjectInfo> {
  if (TEST_HCA_PROJECTS_WITH_UNAVAILABLE_SERVICE.includes(projectsResponse)) {
    return RefreshDataResult.error(
      "DOI to HCA project ID mapping not initialized"
    );
  } else {
    return RefreshDataResult.ok(getProjectsInfo(projectsResponse)[0]);
  }
}
