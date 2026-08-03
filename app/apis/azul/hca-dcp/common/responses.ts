import {
  type AggregatedCellSuspensionsResponse,
  type AggregatedDonorOrganismsResponse,
  type AggregatedFileTypeSummariesResponse,
  type AggregatedProtocolsResponse,
  type AggregatedSamplesResponse,
  type AggregatedSpecimensResponse,
} from "./aggregatedEntities";
import {
  type CellCountSummary,
  type FileTypeSummary,
  type ProjectsEntityResponse,
  type ProjectSummary,
} from "./entities";

/**
 * Model of response returned from /index/projects API endpoint.
 */
export type ProjectsResponse = ProjectsEntityResponse &
  AggregatedCellSuspensionsResponse &
  AggregatedDonorOrganismsResponse &
  AggregatedFileTypeSummariesResponse &
  AggregatedProtocolsResponse &
  AggregatedSamplesResponse &
  AggregatedSpecimensResponse;

/**
 * Model of response returned from /index/summary API endpoint.
 */
export type SummaryResponse = {
  cellCountSummaries: CellCountSummary[];
  donorCount: number;
  fileCount: number;
  fileTypeSummaries: FileTypeSummary[];
  labCount: number;
  organTypes: string[];
  projectCount: number;
  projects: ProjectSummary[];
  speciesCount: number;
  specimenCount: number;
  totalFileSize: number | string;
};
