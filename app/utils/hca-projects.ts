import { ProjectsResponse } from "../apis/azul/hca-dcp/common/responses";
import { normalizeDoi } from "../utils/doi";

export interface ProjectInfo {
  doi: string | null;
  hasPrimaryData: boolean;
  id: string;
  title: string;
}

export function getProjectsInfo(
  projectsResponse: ProjectsResponse
): ProjectInfo[] {
  const projectsInfo: ProjectInfo[] = [];
  const hasPrimaryData = projectsResponse.fileTypeSummaries.some((fileType) =>
    /^fastq(?:\.gz)?$/i.test(fileType.format)
  );
  for (const project of projectsResponse.projects) {
    for (const publication of project.publications) {
      projectsInfo.push({
        doi: publication.doi && normalizeDoi(publication.doi),
        hasPrimaryData,
        id: project.projectId,
        title: project.projectTitle,
      });
    }
  }
  return projectsInfo;
}
