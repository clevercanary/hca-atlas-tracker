import { ProjectsResponse } from "../app/apis/azul/hca-dcp/common/responses";
import {
  DOI_STATUS,
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerDBAtlasOverview,
  HCAAtlasTrackerDBPublishedSourceStudyInfo,
  HCAAtlasTrackerDBSourceStudy,
  HCAAtlasTrackerDBUnpublishedSourceStudyInfo,
  HCAAtlasTrackerSourceStudy,
  ROLE,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import {
  TEST_CELLXGENE_COLLECTIONS_BY_DOI,
  TEST_HCA_PROJECTS_BY_DOI,
} from "./constants";
import { TestAtlas, TestSourceStudy, TestUser } from "./entities";

export function makeTestUser(
  nameId: string,
  role = ROLE.UNREGISTERED,
  disabled = false,
  roleAssociatedResourceIds: string[] = []
): TestUser {
  return {
    authorization: `Bearer ${nameId}`,
    disabled,
    email: `${nameId}@example.com`,
    name: nameId,
    role,
    roleAssociatedResourceIds,
    token: nameId,
  };
}

export function makeTestAtlasOverview(
  atlas: TestAtlas
): HCAAtlasTrackerDBAtlasOverview {
  return {
    completedTaskCount: 0,
    integrationLead: atlas.integrationLead,
    network: atlas.network,
    shortName: atlas.shortName,
    taskCount: 0,
    version: atlas.version,
    wave: atlas.wave,
  };
}

export function makeTestSourceStudyOverview(
  study: TestSourceStudy
):
  | HCAAtlasTrackerDBPublishedSourceStudyInfo
  | HCAAtlasTrackerDBUnpublishedSourceStudyInfo {
  return "unpublishedInfo" in study
    ? {
        capId: null,
        cellxgeneCollectionId: study.cellxgeneCollectionId,
        doiStatus: DOI_STATUS.NA,
        hcaProjectId: study.hcaProjectId,
        publication: null,
        unpublishedInfo: study.unpublishedInfo,
      }
    : {
        capId: study.capId ?? null,
        cellxgeneCollectionId:
          study.cellxgeneCollectionId === undefined
            ? (study.doi &&
                TEST_CELLXGENE_COLLECTIONS_BY_DOI.get(study.doi)
                  ?.collection_id) ??
              null
            : study.cellxgeneCollectionId,
        doiStatus: study.doiStatus,
        hcaProjectId:
          study.hcaProjectId === undefined
            ? (study.doi &&
                TEST_HCA_PROJECTS_BY_DOI.get(study.doi)?.projects[0]
                  .projectId) ??
              null
            : study.hcaProjectId,
        publication: study.publication,
        unpublishedInfo: null,
      };
}

export function makeTestProjectsResponse(
  id: string,
  doi: string,
  title: string,
  fileFormats = ["fastq"]
): ProjectsResponse {
  return {
    cellSuspensions: [],
    donorOrganisms: [],
    fileTypeSummaries: fileFormats.map((format) => ({
      contentDescription: [],
      count: 0,
      fileSource: [],
      format,
      isIntermediate: false,
      matrixCellCount: 0,
      totalSize: 0,
    })),
    projects: [
      {
        accessible: true,
        accessions: [],
        contributedAnalyses: {},
        contributors: [],
        estimatedCellCount: 0,
        laboratory: [],
        matrices: {},
        projectDescription: "",
        projectId: id,
        projectShortname: "",
        projectTitle: title,
        publications: [
          {
            doi,
            officialHcaPublication: null,
            publicationTitle: "",
            publicationUrl: "",
          },
        ],
        supplementaryLinks: [],
      },
    ],
    protocols: [],
    samples: [],
    specimens: [],
  };
}

export async function withConsoleErrorHiding<T>(
  fn: () => Promise<T>,
  hideConsoleError = true
): Promise<T> {
  const consoleErrorSpy = hideConsoleError
    ? jest.spyOn(console, "error").mockImplementation()
    : null;
  const result = await fn();
  consoleErrorSpy?.mockRestore();
  return result;
}

// Adapted from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers#description
export function promiseWithResolvers<T>(): [
  Promise<T>,
  (v: T) => void,
  (v: unknown) => void
] {
  let resolve: (v: T) => void;
  let reject: (v: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- The function passed to the Promise constructor is called immediately, guaranteeing that these will be defined.
  return [promise, resolve!, reject!];
}

export function delay(ms = 5): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function expectApiAtlasToMatchTest(
  apiAtlas: HCAAtlasTrackerAtlas,
  testAtlas: TestAtlas
): void {
  expect(apiAtlas.id).toEqual(testAtlas.id);
  expect(apiAtlas.integrationLead).toEqual(testAtlas.integrationLead);
  expect(apiAtlas.bioNetwork).toEqual(testAtlas.network);
  expect(apiAtlas.shortName).toEqual(testAtlas.shortName);
  expect(apiAtlas.sourceStudyCount).toEqual(testAtlas.sourceStudies.length);
  expect(apiAtlas.status).toEqual(testAtlas.status);
  expect(apiAtlas.targetCompletion).toEqual(
    testAtlas.targetCompletion?.toISOString() ?? null
  );
  expect(apiAtlas.version).toEqual(testAtlas.version);
  expect(apiAtlas.wave).toEqual(testAtlas.wave);
}

export function expectSourceStudyToMatch(
  dbStudy: HCAAtlasTrackerDBSourceStudy,
  apiStudy: HCAAtlasTrackerSourceStudy
): void {
  expect(dbStudy.doi).toEqual(apiStudy.doi);
  expect(dbStudy.id).toEqual(apiStudy.id);
  expect(dbStudy.study_info.capId).toEqual(apiStudy.capId);
  expect(dbStudy.study_info.cellxgeneCollectionId).toEqual(
    apiStudy.cellxgeneCollectionId
  );
  expect(dbStudy.study_info.doiStatus).toEqual(apiStudy.doiStatus);
  expect(dbStudy.study_info.hcaProjectId).toEqual(apiStudy.hcaProjectId);
  if (dbStudy.doi === null) {
    expect(apiStudy.journal).toBeNull();
    expect(apiStudy.publicationDate).toBeNull();
    const { unpublishedInfo } = dbStudy.study_info;
    expect(unpublishedInfo.contactEmail).toEqual(apiStudy.contactEmail);
    expect(unpublishedInfo.referenceAuthor).toEqual(apiStudy.referenceAuthor);
    expect(unpublishedInfo.title).toEqual(apiStudy.title);
  } else {
    const { publication } = dbStudy.study_info;
    if (publication) {
      expect(publication.authors[0]?.name).toEqual(apiStudy.referenceAuthor);
      expect(publication.journal).toEqual(apiStudy.journal);
      expect(publication.publicationDate).toEqual(apiStudy.publicationDate);
      expect(publication.title).toEqual(apiStudy.title);
    } else {
      expect(apiStudy.journal).toBeNull();
      expect(apiStudy.publicationDate).toBeNull();
      expect(apiStudy.referenceAuthor).toBeNull();
      expect(apiStudy.title).toBeNull();
    }
    expect(apiStudy.contactEmail).toBeNull();
  }
}
