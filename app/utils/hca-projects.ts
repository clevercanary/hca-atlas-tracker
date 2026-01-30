import { ProjectsResponse } from "../apis/azul/hca-dcp/common/responses";
import { normalizeDoi } from "../utils/doi";

export interface ProjectInfo {
  atlases: { shortName: string; version: string | null }[];
  doi: string | null;
  hasPrimaryData: boolean;
  id: string;
  networks: string[];
  title: string;
}

export function getProjectsInfo(
  projectsResponse: ProjectsResponse,
): ProjectInfo[] {
  const projectsInfo: ProjectInfo[] = [];
  const hasPrimaryData = projectsResponse.fileTypeSummaries.some((fileType) =>
    /^fastq(?:\.gz)?$/i.test(fileType.format),
  );
  for (const project of projectsResponse.projects) {
    const networks = project.bionetworkName;
    const atlases = project.tissueAtlas.map(({ atlas, version }) => ({
      shortName: atlas,
      version,
    }));
    for (const publication of project.publications) {
      projectsInfo.push({
        atlases,
        doi: publication.doi && normalizeDoi(publication.doi),
        hasPrimaryData,
        id: project.projectId,
        networks: removeArrayNulls(networks),
        title: project.projectTitle,
      });
    }
  }
  return projectsInfo;
}

function removeArrayNulls<T>(array: (T | null)[]): T[] {
  const result: T[] = [];
  for (const item of array) {
    if (item !== null) result.push(item);
  }
  return result;
}
