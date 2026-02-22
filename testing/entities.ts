import {
  ATLAS_STATUS,
  DOI_STATUS,
  DoiPublicationInfo,
  FILE_TYPE,
  FILE_VALIDATION_STATUS,
  FileValidationReports,
  FileValidationSummary,
  GoogleSheetInfo,
  HCAAtlasTrackerDBEntrySheetValidation,
  HCAAtlasTrackerDBFileDatasetInfo,
  HCAAtlasTrackerDBFileValidationInfo,
  HCAAtlasTrackerDBUnpublishedSourceStudyInfo,
  IntegrationLead,
  INTEGRITY_STATUS,
  LinkInfo,
  NetworkKey,
  PUBLICATION_STATUS,
  PublicationInfo,
  REPROCESSED_STATUS,
  ROLE,
  Wave,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";

export interface TestUser {
  authorization: string;
  disabled: boolean;
  email: string;
  name: string;
  role: ROLE;
  roleAssociatedResourceIds: string[];
  token: string;
}

export interface TestAtlas {
  capId?: string | null;
  cellxgeneAtlasCollection: string | null;
  codeLinks: LinkInfo[];
  componentAtlases: string[];
  description: string;
  generation: number;
  highlights: string;
  id: string;
  integrationLead: IntegrationLead[];
  metadataCorrectnessUrl?: string;
  metadataSpecificationUrl?: string;
  network: NetworkKey;
  publications: DoiPublicationInfo[];
  revision: number;
  shortName: string;
  sourceDatasets?: string[];
  sourceStudies: string[];
  status: ATLAS_STATUS;
  targetCompletion?: Date;
  wave: Wave;
}

export interface TestComponentAtlas {
  capUrl?: string | null;
  file: TestFile;
  id: string;
  isLatest?: boolean;
  sourceDatasets?: TestSourceDataset[];
  versionId: string;
  wipNumber?: number;
}

export type TestSourceStudy =
  | TestPublishedSourceStudy
  | TestUnpublishedSourceStudy;

export interface TestPublishedSourceStudy {
  capId?: string;
  cellxgeneCollectionId?: string | null;
  doi: string | null;
  doiStatus: DOI_STATUS;
  hcaProjectId?: string | null;
  id: string;
  metadataSpreadsheets?: GoogleSheetInfo[];
  publication: PublicationInfo | null;
}

export interface TestUnpublishedSourceStudy {
  cellxgeneCollectionId: string | null;
  hcaProjectId: string | null;
  id: string;
  metadataSpreadsheets?: GoogleSheetInfo[];
  unpublishedInfo: HCAAtlasTrackerDBUnpublishedSourceStudyInfo["unpublishedInfo"];
}

export interface TestSourceDataset {
  capUrl?: string | null;
  file: TestFile;
  id: string;
  isLatest?: boolean;
  metadataSpreadsheetTitle?: string | null;
  metadataSpreadsheetUrl?: string | null;
  publicationStatus?: PUBLICATION_STATUS;
  reprocessedStatus?: REPROCESSED_STATUS;
  sourceStudyId?: string | null;
  versionId: string;
  wipNumber?: number;
}

export type NormalizedTestSourceDataset = Required<TestSourceDataset>;

export interface TestFile {
  atlas: TestAtlas | (() => TestAtlas);
  bucket: string;
  datasetInfo?: HCAAtlasTrackerDBFileDatasetInfo | null;
  etag: string;
  eventName?: string;
  eventTime: string;
  fileName: string;
  fileType: FILE_TYPE;
  id: string;
  integrityCheckedAt?: string | null;
  integrityError?: string | null;
  integrityStatus?: INTEGRITY_STATUS;
  isArchived?: boolean;
  isLatest?: boolean;
  sha256Client?: string | null;
  sha256Server?: string | null;
  sizeBytes: string;
  sourceStudyId?: string | null;
  validationInfo?: HCAAtlasTrackerDBFileValidationInfo | null;
  validationReports?: FileValidationReports | null;
  validationStatus?: FILE_VALIDATION_STATUS;
  validationSummary?: FileValidationSummary | null;
  versionId: string | null;
}

export type NormalizedTestFile = Required<TestFile> & {
  resolvedAtlas: TestAtlas;
};

export interface TestConcept {
  atlas: TestAtlas;
  baseFilename: string;
  fileType: FILE_TYPE.INTEGRATED_OBJECT | FILE_TYPE.SOURCE_DATASET;
  id: string;
}

export type TestEntrySheetValidation = HCAAtlasTrackerDBEntrySheetValidation;

export interface TestComment {
  createdAt: string;
  createdBy: TestUser;
  id: string;
  text: string;
  threadId: string;
}
