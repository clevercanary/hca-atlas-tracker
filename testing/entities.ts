import {
  ATLAS_STATUS,
  DOI_STATUS,
  DoiPublicationInfo,
  GoogleSheetInfo,
  HCAAtlasTrackerDBEntrySheetValidation,
  HCAAtlasTrackerDBUnpublishedSourceStudyInfo,
  IntegrationLead,
  LinkInfo,
  NetworkKey,
  PublicationInfo,
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
  description: string;
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
  cellCount?: number;
  cellxgeneDatasetId?: string;
  cellxgeneDatasetVersion?: string;
  disease?: string[];
  id: string;
  metadataSpreadsheetTitle?: string;
  metadataSpreadsheetUrl?: string;
  sourceStudyId: string;
  suspensionType?: string[];
  tissue?: string[];
  title: string;
}

export type TestEntrySheetValidation = HCAAtlasTrackerDBEntrySheetValidation;

export interface TestComment {
  createdAt: string;
  createdBy: TestUser;
  id: string;
  text: string;
  threadId: string;
}
