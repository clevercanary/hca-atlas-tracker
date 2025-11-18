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
  description: string;
  highlights: string;
  id: string;
  integrationLead: IntegrationLead[];
  metadataCorrectnessUrl?: string;
  metadataSpecificationUrl?: string;
  network: NetworkKey;
  publications: DoiPublicationInfo[];
  shortName: string;
  sourceDatasets?: string[];
  sourceStudies: string[];
  status: ATLAS_STATUS;
  targetCompletion?: Date;
  version: string;
  wave: Wave;
}

export interface TestComponentAtlas {
  atlasId: string;
  capUrl?: string | null;
  description: string;
  file?: TestFile | TestFile[];
  id: string;
  sourceDatasets?: TestSourceDataset[];
  title: string;
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
  assay?: string[];
  capUrl?: string | null;
  cellCount?: number;
  cellxgeneDatasetId?: string;
  cellxgeneDatasetVersion?: string;
  disease?: string[];
  file?: TestFile | TestFile[];
  id: string;
  metadataSpreadsheetTitle?: string;
  metadataSpreadsheetUrl?: string;
  publicationStatus?: PUBLICATION_STATUS;
  reprocessedStatus?: REPROCESSED_STATUS;
  sourceStudyId?: string;
  suspensionType?: string[];
  tissue?: string[];
  title: string;
}

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

export type TestEntrySheetValidation = HCAAtlasTrackerDBEntrySheetValidation;

export interface TestComment {
  createdAt: string;
  createdBy: TestUser;
  id: string;
  text: string;
  threadId: string;
}
