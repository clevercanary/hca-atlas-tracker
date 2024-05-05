import { TEST_HCA_PROJECTS_BY_DOI } from "../../../testing/constants";
import { ProjectInfo } from "../hca-projects";

export function getProjectIdByDoi(dois: string[]): string | null {
  return getProjectInfoByDoi(dois)?.id ?? null;
}

export function getProjectInfoByDoi(dois: string[]): ProjectInfo | null {
  for (const doi of dois) {
    const projectsResponse = TEST_HCA_PROJECTS_BY_DOI.get(doi);
    if (projectsResponse) {
      const project = projectsResponse.projects[0];
      return {
        id: project.projectId,
        title: project.projectTitle,
      };
    }
  }
  return null;
}
