import {
  TEST_HCA_PROJECTS_BY_DOI,
  TEST_HCA_PROJECTS_BY_ID,
} from "../../../testing/constants";
import { getProjectsInfo, ProjectInfo } from "../../utils/hca-projects";

export function areProjectsRefreshing(): boolean {
  return false;
}

export function getProjectIdByDoi(dois: string[]): string | null {
  return getProjectInfoByDoi(dois)?.id ?? null;
}

export function getProjectInfoByDoi(dois: string[]): ProjectInfo | null {
  for (const doi of dois) {
    const projectsResponse = TEST_HCA_PROJECTS_BY_DOI.get(doi);
    if (projectsResponse) {
      return getProjectsInfo(projectsResponse)[0];
    }
  }
  return null;
}

export function getProjectInfoById(id: string): ProjectInfo | null {
  const projectsResponse = TEST_HCA_PROJECTS_BY_ID.get(id);
  return projectsResponse ? getProjectsInfo(projectsResponse)[0] : null;
}
