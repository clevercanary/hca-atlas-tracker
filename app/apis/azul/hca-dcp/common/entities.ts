/**
 * Model of accession value in the response from index/projects API endpoints.
 */
export interface AccessionResponse {
  accession: string;
  namespace: string;
}

/**
 * Model of cell count summary from index/summary API endpoints.
 */
export interface CellCountSummary {
  countOfDocsWithOrganType: number;
  organType: string[];
  totalCellCountByOrgan: number;
}

/**
 * Model of contributor value in the response from index/projects API endpoint.
 */
export interface ContributorResponse {
  contactName: string;
  correspondingContributor?: boolean;
  email: string | null;
  institution: string;
  laboratory?: string | null;
  projectRole?: string | null;
}

/**
 * Model of file type summary from index/summary API endpoints.
 */
export interface FileTypeSummary {
  count: number;
  format: string;
  matrixCellCount: number;
  totalSize: number;
}

/**
 * Model of project value in the response from index/projects API endpoint.
 */
export interface ProjectResponse {
  accessible: boolean;
  accessions: AccessionResponse[];
  bionetworkName: (string | null)[];
  contributedAnalyses: ProjectResponseContributedAnalyses;
  contributors: ContributorResponse[];
  estimatedCellCount: number | null;
  laboratory: (string | null)[];
  matrices: ProjectResponseMatrices;
  projectDescription: string;
  projectId: string;
  projectShortname: string;
  projectTitle: string;
  publications: PublicationResponse[];
  supplementaryLinks: (string | null)[];
  tissueAtlas: { atlas: string; version: string | null }[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO - revisit nested Azul structure.
export type ProjectResponseContributedAnalyses = { [key: string]: unknown };

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO - revisit nested Azul structure.
export type ProjectResponseMatrices = { [key: string]: unknown };

/**
 * Model of projects in the response from /index/projects API endpoint.
 */
export interface ProjectsEntityResponse {
  projects: ProjectResponse[];
}

/**
 * Model of project summary in the response from /index/summary API endpoint.
 */
export interface ProjectSummary {
  cellSuspensions: { totalCells: number };
  projects: { estimatedCellCount: number };
}

/**
 * Model of publication value in the response from index/projects API endpoint.
 */
export interface PublicationResponse {
  doi: string | null;
  officialHcaPublication: boolean | null;
  publicationTitle: string;
  publicationUrl: string;
}
