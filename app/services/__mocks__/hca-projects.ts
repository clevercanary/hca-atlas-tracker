import { TEST_HCA_PROJECTS_BY_DOI } from "../../../testing/constants";
import { ProjectInfo } from "../hca-projects";

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
      const project = projectsResponse.projects[0];
      return {
        hasPrimaryData: projectsResponse.fileTypeSummaries.some((fileType) =>
          /^fastq(?:\.gz)?$/i.test(fileType.format)
        ),
        id: project.projectId,
        title: project.projectTitle,
      };
    }
  }
  return null;
}
