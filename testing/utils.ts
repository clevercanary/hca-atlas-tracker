import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { ProjectsResponse } from "../app/apis/azul/hca-dcp/common/responses";
import {
  DOI_STATUS,
  FILE_PUBLISHED_STATUS,
  FILE_TYPE,
  FILE_VALIDATION_STATUS,
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerAtlasSummary,
  HCAAtlasTrackerComponentAtlas,
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBAtlasOverview,
  HCAAtlasTrackerDBFileValidationInfo,
  HCAAtlasTrackerDBPublishedSourceStudyInfo,
  HCAAtlasTrackerDBSourceDataset,
  HCAAtlasTrackerDBSourceDatasetInfo,
  HCAAtlasTrackerDBSourceStudy,
  HCAAtlasTrackerDBUnpublishedSourceStudyInfo,
  HCAAtlasTrackerDBUser,
  HCAAtlasTrackerDBValidation,
  HCAAtlasTrackerDetailComponentAtlas,
  HCAAtlasTrackerDetailSourceDataset,
  HCAAtlasTrackerLocalListSourceDataset,
  HCAAtlasTrackerSourceDataset,
  HCAAtlasTrackerSourceStudy,
  HCAAtlasTrackerUser,
  HCAAtlasTrackerValidationRecordWithoutAtlases,
  INTEGRITY_STATUS,
  LinkedAtlasFields,
  LinkedAtlasSummary,
  NetworkKey,
  PUBLICATION_STATUS,
  REPROCESSED_STATUS,
  ROLE,
  SYSTEM,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import {
  NewUserData,
  UserEditData,
} from "../app/apis/catalog/hca-atlas-tracker/common/schema";
import {
  getPublishedCitation,
  getUnpublishedCitation,
} from "../app/apis/catalog/hca-atlas-tracker/common/utils";
import { METHOD } from "../app/common/entities";
import { Handler } from "../app/utils/api-handler";
import { slugifyAtlasShortName } from "../app/utils/atlases";
import {
  getFileBaseName,
  normalizeValidationSummary,
  removeFileExtension,
} from "../app/utils/files";
import {
  ATLAS_DRAFT,
  DEFAULT_USERS_BY_ROLE,
  INITIAL_EXPLICIT_TEST_CONCEPTS_BY_ID,
  INITIAL_STANDALONE_TEST_FILES,
  INITIAL_TEST_COMPONENT_ATLASES,
  INITIAL_TEST_SOURCE_DATASETS,
  INTEGRATION_LEADS_BY_ATLAS_ID,
  TEST_CELLXGENE_COLLECTIONS_BY_DOI,
  TEST_HCA_PROJECTS_BY_DOI,
  USER_INTEGRATION_LEAD_DRAFT,
  USER_INTEGRATION_LEAD_PUBLIC,
} from "./constants";
import {
  NormalizedTestFile,
  NormalizedTestSourceDataset,
  TestAtlas,
  TestComponentAtlas,
  TestFile,
  TestPublishedSourceStudy,
  TestSourceDataset,
  TestSourceStudy,
  TestUnpublishedSourceStudy,
  TestUser,
} from "./entities";

type ConsoleMessageFunctionName =
  (typeof CONSOLE_MESSAGE_FUNCTION_NAMES)[number];

const CONSOLE_MESSAGE_FUNCTION_NAMES = [
  "debug",
  "error",
  "info",
  "log",
  "warn",
] as const;

export type ConsoleMessageOutputArrays = Partial<
  Record<ConsoleMessageFunctionName, unknown[][]>
>;

export function makeTestUser(
  nameId: string,
  role = ROLE.UNREGISTERED,
  disabled = false,
  roleAssociatedResourceIds: string[] = [],
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
  atlas: TestAtlas,
): HCAAtlasTrackerDBAtlasOverview {
  return {
    capId: atlas.capId ?? null,
    cellxgeneAtlasCollection: atlas.cellxgeneAtlasCollection,
    codeLinks: atlas.codeLinks,
    completedTaskCount: 0,
    description: atlas.description,
    highlights: atlas.highlights,
    ingestionTaskCounts: {
      [SYSTEM.CAP]: { completedCount: 0, count: 0 },
      [SYSTEM.CELLXGENE]: { completedCount: 0, count: 0 },
      [SYSTEM.HCA_DATA_REPOSITORY]: { completedCount: 0, count: 0 },
    },
    integrationLead: atlas.integrationLead,
    metadataCorrectnessUrl: atlas.metadataCorrectnessUrl ?? null,
    metadataSpecificationTitle: null,
    metadataSpecificationUrl: atlas.metadataSpecificationUrl ?? null,
    network: atlas.network,
    publications: atlas.publications,
    shortName: atlas.shortName,
    taskCount: 0,
    wave: atlas.wave,
  };
}

export function getTestAtlasShortNameSlug(atlas: TestAtlas): string {
  return slugifyAtlasShortName(atlas.shortName);
}

export function makeTestSourceStudyOverview(
  study: TestSourceStudy,
):
  | HCAAtlasTrackerDBPublishedSourceStudyInfo
  | HCAAtlasTrackerDBUnpublishedSourceStudyInfo {
  return "unpublishedInfo" in study
    ? {
        capId: null,
        cellxgeneCollectionId: study.cellxgeneCollectionId,
        doiStatus: DOI_STATUS.NA,
        hcaProjectId: study.hcaProjectId,
        metadataSpreadsheets: study.metadataSpreadsheets ?? [],
        publication: null,
        unpublishedInfo: study.unpublishedInfo,
      }
    : {
        capId: study.capId ?? null,
        cellxgeneCollectionId: getTestPublishedSourceStudyCellxGeneId(study),
        doiStatus: study.doiStatus,
        hcaProjectId: getTestPublishedSourceStudyHcaId(study),
        metadataSpreadsheets: study.metadataSpreadsheets ?? [],
        publication: study.publication,
        unpublishedInfo: null,
      };
}

function getTestPublishedSourceStudyCellxGeneId(
  study: TestPublishedSourceStudy,
): string | null {
  return study.cellxgeneCollectionId === undefined
    ? ((study.doi &&
        TEST_CELLXGENE_COLLECTIONS_BY_DOI.get(study.doi)?.collection_id) ??
        null)
    : study.cellxgeneCollectionId;
}

function getTestPublishedSourceStudyHcaId(
  study: TestPublishedSourceStudy,
): string | null {
  return study.hcaProjectId === undefined
    ? ((study.doi &&
        TEST_HCA_PROJECTS_BY_DOI.get(study.doi)?.projects[0].projectId) ??
        null)
    : study.hcaProjectId;
}

export function makeTestSourceDatasetInfo(
  sourceDataset: NormalizedTestSourceDataset,
): HCAAtlasTrackerDBSourceDatasetInfo {
  return {
    capUrl: sourceDataset.capUrl,
    metadataSpreadsheetTitle: sourceDataset.metadataSpreadsheetTitle,
    metadataSpreadsheetUrl: sourceDataset.metadataSpreadsheetUrl,
    publicationStatus: sourceDataset.publicationStatus,
  };
}

export function makeTestProjectsResponse(
  id: string,
  doi: string,
  title: string,
  fileFormats = ["fastq"],
  atlases?: { shortName: string; version: string }[],
  networks?: string[],
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
        bionetworkName: networks ?? [],
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
        tissueAtlas:
          atlases?.map(({ shortName, version }) => ({
            atlas: shortName,
            version,
          })) ?? [],
      },
    ],
    protocols: [],
    samples: [],
    specimens: [],
  };
}

export function fillTestSourceDatasetDefaults(
  sourceDataset: TestSourceDataset,
): NormalizedTestSourceDataset {
  const {
    capUrl = null,
    file,
    isLatest = true,
    metadataSpreadsheetTitle = null,
    metadataSpreadsheetUrl = null,
    publicationStatus = PUBLICATION_STATUS.UNSPECIFIED,
    publishedAt = null,
    reprocessedStatus = REPROCESSED_STATUS.UNSPECIFIED,
    revision = 1,
    sourceStudyId = null,
    wipNumber = 1,
    ...restFields
  } = sourceDataset;
  return {
    capUrl,
    file,
    isLatest,
    metadataSpreadsheetTitle,
    metadataSpreadsheetUrl,
    publicationStatus,
    publishedAt,
    reprocessedStatus,
    revision,
    sourceStudyId,
    wipNumber,
    ...restFields,
  };
}

export function getNormalizedFileForTestEntity(
  testEntity: TestSourceDataset | TestComponentAtlas,
): NormalizedTestFile {
  return fillTestFileDefaults(testEntity.file);
}

export function fillTestFileDefaults(file: TestFile): NormalizedTestFile {
  const {
    atlas,
    datasetInfo = null,
    eventName = "ObjectCreated:*",
    integrityCheckedAt = null,
    integrityStatus = INTEGRITY_STATUS.PENDING,
    isArchived = false,
    isLatest = true,
    sha256Client = null,
    sha256Server = null,
    sourceStudyId = null,
    validationReports = null,
    validationStatus = FILE_VALIDATION_STATUS.PENDING,
    validationSummary = null,
    ...restFields
  } = file;
  const resolvedAtlas = typeof atlas === "function" ? atlas() : atlas;
  const validationInfo: HCAAtlasTrackerDBFileValidationInfo | null =
    file.validationInfo !== undefined
      ? file.validationInfo
      : integrityCheckedAt === null
        ? null
        : {
            batchJobId: `batch-job-${file.id}`,
            snsMessageId: `sns-message-${file.id}`,
            snsMessageTime: integrityCheckedAt,
          };
  return {
    atlas,
    datasetInfo,
    eventName,
    integrityCheckedAt,
    integrityStatus,
    isArchived,
    isLatest,
    resolvedAtlas,
    sha256Client,
    sha256Server,
    sourceStudyId,
    validationInfo,
    validationReports,
    validationStatus,
    validationSummary,
    ...restFields,
  };
}

export function getTestFileKey(file: TestFile, atlas: TestAtlas): string {
  let folderName: string;
  switch (file.fileType) {
    case FILE_TYPE.INGEST_MANIFEST:
      folderName = "manifests";
      break;
    case FILE_TYPE.INTEGRATED_OBJECT:
      folderName = "integrated-objects";
      break;
    case FILE_TYPE.SOURCE_DATASET:
      folderName = "source-datasets";
      break;
  }
  return `${atlas.network}/${getTestAtlasShortNameSlug(atlas)}-v${atlas.generation}-${atlas.revision}/${folderName}/${file.fileName}`;
}

export function getTestSourceStudyCitation(
  sourceStudy: TestSourceStudy,
): string {
  if ("doi" in sourceStudy) {
    return getPublishedCitation(
      sourceStudy.doiStatus,
      sourceStudy.publication?.authors[0].name ?? null,
      sourceStudy.publication?.publicationDate ?? null,
      sourceStudy.publication?.journal ?? null,
    );
  } else {
    return getUnpublishedCitation(
      sourceStudy.unpublishedInfo.referenceAuthor,
      sourceStudy.unpublishedInfo.contactEmail,
    );
  }
}

export function getTestEntityDownloadName(
  entity: TestComponentAtlas | TestSourceDataset,
): string {
  return removeFileExtension(getTestEntityBaseFilename(entity));
}

function getTestEntityBaseFilename(
  entity: TestComponentAtlas | TestSourceDataset,
): string {
  return (
    INITIAL_EXPLICIT_TEST_CONCEPTS_BY_ID.get(entity.id)?.baseFilename ??
    entity.file.fileName
  );
}

export function getAllTestFiles(): TestFile[] {
  return INITIAL_STANDALONE_TEST_FILES.concat(
    INITIAL_TEST_SOURCE_DATASETS.flatMap((d) => d.file ?? []),
    INITIAL_TEST_COMPONENT_ATLASES.flatMap((c) => c.file ?? []),
  );
}

export function withConsoleErrorHiding<T>(
  fn: () => Promise<T>,
  hideConsoleError = true,
  errorsOutputArray?: unknown[][],
): Promise<T> {
  return withConsoleMessageHiding(
    fn,
    hideConsoleError,
    { error: errorsOutputArray },
    ["error"],
  );
}

export async function withConsoleMessageHiding<T>(
  fn: () => Promise<T>,
  enableHiding = true,
  outputArrays?: ConsoleMessageOutputArrays,
  messageTypes: readonly ConsoleMessageFunctionName[] = CONSOLE_MESSAGE_FUNCTION_NAMES,
): Promise<T> {
  const spies = enableHiding
    ? Array.from(new Set(messageTypes), (messageType) => {
        return jest
          .spyOn(console, messageType)
          .mockImplementation((...messages) => {
            outputArrays?.[messageType]?.push(messages);
          });
      })
    : [];
  const result = await fn();
  spies.forEach((spy) => spy.mockRestore());
  return result;
}

// Adapted from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers#description
export function promiseWithResolvers<T>(): [
  Promise<T>,
  (v: T) => void,
  (v: unknown) => void,
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

export function testApiRole(
  testNameBase: string,
  route: string,
  handler: Handler,
  method: METHOD,
  role: ROLE,
  query: (() => Record<string, string>) | Record<string, string> | undefined,
  body: httpMocks.Body | undefined,
  hideConsoleError: boolean,
  callback: (
    res: httpMocks.MockResponse<NextApiResponse>,
    user: TestUser,
  ) => void | Promise<void>,
): void {
  let user: TestUser;
  let testName: string;
  if (
    role === ROLE.INTEGRATION_LEAD &&
    query &&
    typeof query !== "function" &&
    "atlasId" in query
  ) {
    if (method === METHOD.GET) {
      user =
        query.atlasId === ATLAS_DRAFT.id
          ? USER_INTEGRATION_LEAD_PUBLIC
          : USER_INTEGRATION_LEAD_DRAFT;
      testName = `${testNameBase} when GET requested by user with INTEGRATION_LEAD role for another atlas`;
    } else {
      user = INTEGRATION_LEADS_BY_ATLAS_ID[query.atlasId];
      if (!user) throw new Error("No appropriate user found for test");
      testName = `${testNameBase} when ${method} requested by user with INTEGRATION_LEAD role for the atlas`;
    }
  } else {
    user = DEFAULT_USERS_BY_ROLE[role];
    testName = `${testNameBase} when ${method} requested by user with ${role} role`;
  }
  it(testName, async () => {
    const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>(
      {
        body,
        headers: { authorization: user.authorization },
        method,
        query: typeof query === "function" ? query() : query,
      },
    );
    await withConsoleErrorHiding(() => handler(req, res), hideConsoleError);
    await callback(res, user);
  });
}

export function expectAtlasSummaryToMatchTestAtlas(
  atlasSummary: HCAAtlasTrackerAtlasSummary,
  testAtlas: TestAtlas,
): void {
  const expectedVersion = `v${testAtlas.generation}.${testAtlas.revision}`;
  expect(atlasSummary.id).toEqual(testAtlas.id);
  expect(atlasSummary.name).toEqual(
    `${testAtlas.shortName} ${expectedVersion}`,
  );
  expect(atlasSummary.network).toEqual(testAtlas.network);
  expect(atlasSummary.publishedAt).toEqual(testAtlas.publishedAt ?? null);
  expect(atlasSummary.shortName).toEqual(testAtlas.shortName);
  expect(atlasSummary.shortNameSlug).toEqual(
    getTestAtlasShortNameSlug(testAtlas),
  );
  expect(atlasSummary.version).toEqual(expectedVersion);
}

export function expectApiAtlasToMatchTest(
  apiAtlas: HCAAtlasTrackerAtlas,
  testAtlas: TestAtlas,
): void {
  expectApiAtlasToMatchTestWithoutRevision(apiAtlas, testAtlas);
  expect(apiAtlas.publishedAt).toEqual(testAtlas.publishedAt ?? null);
  expect(apiAtlas.id).toEqual(testAtlas.id);
  expect(apiAtlas.revision).toEqual(testAtlas.revision);
}

export function expectApiAtlasToMatchTestWithoutRevision(
  apiAtlas: HCAAtlasTrackerAtlas,
  testAtlas: TestAtlas,
): void {
  expect(apiAtlas.cellxgeneAtlasCollection).toEqual(
    testAtlas.cellxgeneAtlasCollection,
  );
  expect(apiAtlas.codeLinks).toEqual(testAtlas.codeLinks);
  expect(apiAtlas.description).toEqual(testAtlas.description);
  expect(apiAtlas.highlights).toEqual(testAtlas.highlights);
  expect(apiAtlas.integrationLead).toEqual(testAtlas.integrationLead);
  expect(apiAtlas.bioNetwork).toEqual(testAtlas.network);
  expect(apiAtlas.publications).toEqual(testAtlas.publications);
  expect(apiAtlas.shortName).toEqual(testAtlas.shortName);
  expect(apiAtlas.shortNameSlug).toEqual(getTestAtlasShortNameSlug(testAtlas));
  expect(apiAtlas.sourceStudyCount).toEqual(testAtlas.sourceStudies.length);
  expect(apiAtlas.status).toEqual(testAtlas.status);
  expect(apiAtlas.targetCompletion).toEqual(
    testAtlas.targetCompletion?.toISOString() ?? null,
  );
  expect(apiAtlas.generation).toEqual(testAtlas.generation);
  expect(apiAtlas.wave).toEqual(testAtlas.wave);

  // Check `isLatest` to the extent that is possible just based on the test atlas definition; tests can do additional checks separately as needed
  if (testAtlas.publishedAt) expect(apiAtlas.isLatest).toBeDefined();
  else expect(apiAtlas.isLatest).toEqual(true);
}

export function expectDbAtlasToMatchApi(
  dbAtlas: HCAAtlasTrackerDBAtlas,
  apiAtlas: HCAAtlasTrackerAtlas,
  expectedComponentAtlasCount = 0,
): void {
  expect(dbAtlas.overview.network).toEqual(apiAtlas.bioNetwork);
  expect(dbAtlas.overview.completedTaskCount).toEqual(
    apiAtlas.completedTaskCount,
  );
  expect(dbAtlas.id).toEqual(apiAtlas.id);
  expect(dbAtlas.overview.integrationLead).toEqual(apiAtlas.integrationLead);
  expect(dbAtlas.overview.shortName).toEqual(apiAtlas.shortName);
  expect(dbAtlas.overview.publications).toEqual(apiAtlas.publications);
  expect(dbAtlas.short_name_slug).toEqual(apiAtlas.shortNameSlug);
  expect(dbAtlas.source_studies).toHaveLength(apiAtlas.sourceStudyCount);
  expect(dbAtlas.status).toEqual(apiAtlas.status);
  expect(dbAtlas.target_completion?.toISOString() ?? null).toEqual(
    apiAtlas.targetCompletion,
  );
  expect(dbAtlas.overview.taskCount).toEqual(apiAtlas.taskCount);
  expect(dbAtlas.generation).toEqual(apiAtlas.generation);
  expect(dbAtlas.published_at?.toISOString() ?? null).toEqual(
    apiAtlas.publishedAt,
  );
  expect(dbAtlas.revision).toEqual(apiAtlas.revision);
  expect(dbAtlas.overview.wave).toEqual(apiAtlas.wave);
  expect(apiAtlas.componentAtlasCount).toEqual(expectedComponentAtlasCount);
}

export function expectApiSourceStudyToMatchTest(
  apiStudy: HCAAtlasTrackerSourceStudy,
  testStudy: TestSourceStudy,
): void {
  if ("unpublishedInfo" in testStudy) {
    expectApiSourceStudyToMatchUnpublishedTest(apiStudy, testStudy);
  } else {
    expectApiSourceStudyToMatchPublishedTest(apiStudy, testStudy);
  }
}

export function expectApiSourceStudyToMatchPublishedTest(
  apiStudy: HCAAtlasTrackerSourceStudy | undefined,
  testStudy: TestPublishedSourceStudy,
): void {
  expect(apiStudy).toBeDefined();
  if (!apiStudy) return;

  expect(apiStudy.capId).toEqual(testStudy.capId ?? null);
  expect(apiStudy.cellxgeneCollectionId).toEqual(
    getTestPublishedSourceStudyCellxGeneId(testStudy),
  );
  expect(apiStudy.contactEmail).toBeNull();
  expect(apiStudy.doi).toEqual(testStudy.doi);
  expect(apiStudy.doiStatus).toEqual(testStudy.doiStatus);
  expect(apiStudy.hcaProjectId).toEqual(
    getTestPublishedSourceStudyHcaId(testStudy),
  );
  expect(apiStudy.id).toEqual(testStudy.id);
  expect(apiStudy.metadataSpreadsheets).toEqual(
    testStudy.metadataSpreadsheets ?? [],
  );
  expect(apiStudy.sourceDatasetCount).toEqual(expect.any(Number));
  expect(apiStudy.tasks).toEqual(expect.arrayOf(expect.anything()));
  if (testStudy.publication) {
    expect(apiStudy.title).toEqual(testStudy.publication.title);
    expect(apiStudy.journal).toEqual(testStudy.publication.journal);
    expect(apiStudy.publicationDate).toEqual(
      testStudy.publication.publicationDate,
    );
    expect(apiStudy.referenceAuthor).toEqual(
      testStudy.publication.authors[0]?.name,
    );
  } else {
    expect(apiStudy.title).toBeNull();
    expect(apiStudy.journal).toBeNull();
    expect(apiStudy.publicationDate).toBeNull();
    expect(apiStudy.referenceAuthor).toBeNull();
  }
}

export function expectApiSourceStudyToMatchUnpublishedTest(
  apiStudy: HCAAtlasTrackerSourceStudy | undefined,
  testStudy: TestUnpublishedSourceStudy,
): void {
  expect(apiStudy).toBeDefined();
  if (!apiStudy) return;
  expect(apiStudy.doi).toBeNull();
  expect(apiStudy.doiStatus).toEqual(DOI_STATUS.NA);
  expect(apiStudy.cellxgeneCollectionId).toEqual(
    testStudy.cellxgeneCollectionId,
  );
  expect(apiStudy.contactEmail).toEqual(testStudy.unpublishedInfo.contactEmail);
  expect(apiStudy.hcaProjectId).toEqual(testStudy.hcaProjectId);
  expect(apiStudy.id).toEqual(testStudy.id);
  expect(apiStudy.journal).toBeNull();
  expect(apiStudy.metadataSpreadsheets).toEqual(
    testStudy.metadataSpreadsheets ?? [],
  );
  expect(apiStudy.publicationDate).toBeNull();
  expect(apiStudy.referenceAuthor).toEqual(
    testStudy.unpublishedInfo.referenceAuthor,
  );
  expect(apiStudy.sourceDatasetCount).toEqual(expect.any(Number));
  expect(apiStudy.tasks).toEqual(expect.arrayOf(expect.anything()));
  expect(apiStudy.title).toEqual(testStudy.unpublishedInfo.title);

  // Cap ID can exist for unpublished source studies in practice, but the test types currently don't allow specifying it
  expect(apiStudy.capId).toBeNull();
}

export function expectSourceStudyToMatch(
  dbStudy: HCAAtlasTrackerDBSourceStudy,
  apiStudy: HCAAtlasTrackerSourceStudy,
): void {
  expect(dbStudy.doi).toEqual(apiStudy.doi);
  expect(dbStudy.id).toEqual(apiStudy.id);
  expect(dbStudy.study_info.capId).toEqual(apiStudy.capId);
  expect(dbStudy.study_info.cellxgeneCollectionId).toEqual(
    apiStudy.cellxgeneCollectionId,
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

export function expectApiSourceDatasetsToHaveComponentAtlases(
  apiSourceDatasets: HCAAtlasTrackerLocalListSourceDataset[],
  expectedComponentAtlases: Array<{
    componentAtlases: TestComponentAtlas[];
    sourceDataset: TestSourceDataset;
  }>,
): void {
  expect(apiSourceDatasets).toHaveLength(expectedComponentAtlases.length);
  for (const { componentAtlases, sourceDataset } of expectedComponentAtlases) {
    const apiSourceDataset = apiSourceDatasets.find(
      (d) => d.id === sourceDataset.id,
    );
    assertExpectDefined(apiSourceDataset);
    expect(apiSourceDataset.componentAtlases).toHaveLength(
      componentAtlases.length,
    );
    for (const componentAtlas of componentAtlases) {
      const componentAtlasSummary = apiSourceDataset.componentAtlases.find(
        (c) => c.id === componentAtlas.id,
      );
      expect(componentAtlasSummary).toEqual({
        id: componentAtlas.id,
        name: getFileBaseName(componentAtlas.file.fileName),
      });
    }
  }
}

export function expectApiSourceDatasetsToMatchTest(
  apiSourceDatasets: HCAAtlasTrackerSourceDataset[],
  testSourceDatasets: TestSourceDataset[],
): void {
  expect(apiSourceDatasets).toHaveLength(testSourceDatasets.length);
  for (const testSourceDataset of testSourceDatasets) {
    const apiSourceDataset = apiSourceDatasets.find(
      (c) => c.id === testSourceDataset.id,
    );
    if (!expectIsDefined(apiSourceDataset)) continue;
    expectApiSourceDatasetToMatchTest(apiSourceDataset, testSourceDataset);
  }
}

export function expectDetailApiSourceDatasetToMatchTest(
  apiSourceDataset: HCAAtlasTrackerDetailSourceDataset,
  testSourceDataset: TestSourceDataset,
): void {
  expectApiSourceDatasetToMatchTest(
    apiSourceDataset,
    testSourceDataset,
    true,
    (testFile) => {
      expect(apiSourceDataset.validationReports).toEqual(
        testFile.validationReports,
      );
    },
  );
}

export function expectApiSourceDatasetToMatchTest(
  apiSourceDataset: HCAAtlasTrackerSourceDataset,
  baseTestSourceDataset: TestSourceDataset,
  expectDetail = false,
  doAdditionalChecks?: (file: NormalizedTestFile) => void,
): void {
  const testSourceDataset = fillTestSourceDatasetDefaults(
    baseTestSourceDataset,
  );

  if (!expectIsDefined(testSourceDataset.file)) return;
  const testFile = getNormalizedFileForTestEntity(testSourceDataset);

  expect(apiSourceDataset.assay).toEqual(testFile.datasetInfo?.assay ?? []);
  expect(apiSourceDataset.baseFileName).toEqual(
    getTestEntityBaseFilename(testSourceDataset),
  );
  expect(apiSourceDataset.capUrl).toEqual(testSourceDataset.capUrl);
  expect(apiSourceDataset.cellCount).toEqual(
    testFile.datasetInfo?.cellCount ?? 0,
  );
  expect(apiSourceDataset.disease).toEqual(testFile.datasetInfo?.disease ?? []);
  expect(apiSourceDataset.fileEventTime).toEqual(testFile.eventTime);
  expect(apiSourceDataset.fileId).toEqual(testFile.id);
  expect(apiSourceDataset.fileName).toEqual(testFile.fileName);
  expect(apiSourceDataset.geneCount).toEqual(
    testFile.datasetInfo?.geneCount ?? null,
  );
  expect(apiSourceDataset.integrityStatus).toEqual(testFile.integrityStatus);
  expect(apiSourceDataset.isArchived).toEqual(testFile.isArchived);
  expect(apiSourceDataset.metadataSpreadsheetTitle).toEqual(
    testSourceDataset.metadataSpreadsheetTitle,
  );
  expect(apiSourceDataset.metadataSpreadsheetUrl).toEqual(
    testSourceDataset.metadataSpreadsheetUrl,
  );
  expect(apiSourceDataset.publicationStatus).toEqual(
    testSourceDataset.publicationStatus,
  );
  expect(apiSourceDataset.publishedAt).toEqual(testSourceDataset.publishedAt);
  expect(apiSourceDataset.reprocessedStatus).toEqual(
    testSourceDataset.reprocessedStatus,
  );
  expect(apiSourceDataset.revision).toEqual(testSourceDataset.revision);
  expect(apiSourceDataset.sizeBytes).toEqual(Number(testFile.sizeBytes));
  expect(apiSourceDataset.sourceStudyId).toEqual(
    testSourceDataset.sourceStudyId,
  );
  expect(apiSourceDataset.status).toEqual(
    expectedFilePublishedStatus(testSourceDataset.publishedAt),
  );
  expect(apiSourceDataset.suspensionType).toEqual(
    testFile.datasetInfo?.suspensionType ?? [],
  );
  expect(apiSourceDataset.tissue).toEqual(testFile.datasetInfo?.tissue ?? []);
  expect(apiSourceDataset.title).toEqual(testFile.datasetInfo?.title ?? "");
  expect(apiSourceDataset.validationErrorMessage).toEqual(
    testFile.validationInfo?.errorMessage ?? null,
  );
  expect(apiSourceDataset.validationStatus).toEqual(testFile.validationStatus);
  expect(apiSourceDataset.validationSummary).toEqual(
    normalizeValidationSummary(testFile.validationSummary),
  );
  expect(apiSourceDataset.wipNumber).toEqual(testSourceDataset.wipNumber);

  if (expectDetail) {
    expect(apiSourceDataset).toHaveProperty("validationReports");
  } else {
    expect(apiSourceDataset).not.toHaveProperty("validationReports");
  }

  doAdditionalChecks?.(testFile);
}

export function expectDbSourceDatasetToMatchTest(
  dbSourceDataset: HCAAtlasTrackerDBSourceDataset,
  testSourceDataset: TestSourceDataset,
): void {
  expect(dbSourceDataset.sd_info.publicationStatus).toEqual(
    testSourceDataset.publicationStatus ?? PUBLICATION_STATUS.UNSPECIFIED,
  );
  expect(dbSourceDataset.published_at?.toISOString() ?? null).toEqual(
    testSourceDataset.publishedAt ?? null,
  );
  expect(dbSourceDataset.reprocessed_status).toEqual(
    testSourceDataset.reprocessedStatus ?? REPROCESSED_STATUS.UNSPECIFIED,
  );
  expect(dbSourceDataset.revision).toEqual(testSourceDataset.revision ?? 1);
  expect(dbSourceDataset.source_study_id).toEqual(
    testSourceDataset.sourceStudyId ?? null,
  );
  expect(dbSourceDataset.wip_number).toEqual(testSourceDataset.wipNumber ?? 1);
}

export function expectDetailApiComponentAtlasToMatchTest(
  apiComponentAtlas: HCAAtlasTrackerDetailComponentAtlas,
  testComponentAtlas: TestComponentAtlas,
): void {
  expectApiComponentAtlasToMatchTest(
    apiComponentAtlas,
    testComponentAtlas,
    true,
    (testFile) => {
      expect(apiComponentAtlas.validationReports).toEqual(
        testFile.validationReports,
      );
    },
  );
}

export function expectApiComponentAtlasToMatchTest(
  apiComponentAtlas: HCAAtlasTrackerComponentAtlas,
  testComponentAtlas: TestComponentAtlas,
  expectDetail = false,
  doAdditionalChecks?: (file: NormalizedTestFile) => void,
): void {
  if (!expectIsDefined(testComponentAtlas.file)) return;
  const testFile = getNormalizedFileForTestEntity(testComponentAtlas);

  expect(apiComponentAtlas.assay).toEqual(testFile.datasetInfo?.assay ?? []);
  expect(apiComponentAtlas.baseFileName).toEqual(
    getTestEntityBaseFilename(testComponentAtlas),
  );
  expect(apiComponentAtlas.capUrl).toEqual(testComponentAtlas.capUrl ?? null);
  expect(apiComponentAtlas.cellCount).toEqual(
    testFile.datasetInfo?.cellCount ?? 0,
  );
  expect(apiComponentAtlas.disease).toEqual(
    testFile.datasetInfo?.disease ?? [],
  );
  expect(apiComponentAtlas.fileEventTime).toEqual(testFile.eventTime);
  expect(apiComponentAtlas.fileId).toEqual(testFile.id);
  expect(apiComponentAtlas.fileName).toEqual(testFile.fileName);
  expect(apiComponentAtlas.geneCount).toEqual(
    testFile.datasetInfo?.geneCount ?? null,
  );
  expect(apiComponentAtlas.integrityStatus).toEqual(testFile.integrityStatus);
  expect(apiComponentAtlas.isArchived).toEqual(testFile.isArchived);
  expect(apiComponentAtlas.publishedAt).toEqual(
    testComponentAtlas.publishedAt ?? null,
  );
  expect(apiComponentAtlas.revision).toEqual(testComponentAtlas.revision ?? 1);
  expect(apiComponentAtlas.sizeBytes).toEqual(Number(testFile.sizeBytes));
  expect(apiComponentAtlas.status).toEqual(
    expectedFilePublishedStatus(testComponentAtlas.publishedAt),
  );
  expect(apiComponentAtlas.suspensionType).toEqual(
    testFile.datasetInfo?.suspensionType ?? [],
  );
  expect(apiComponentAtlas.tissue).toEqual(testFile.datasetInfo?.tissue ?? []);
  expect(apiComponentAtlas.title).toEqual(testFile.datasetInfo?.title ?? "");
  expect(apiComponentAtlas.validationErrorMessage).toEqual(
    testFile.validationInfo?.errorMessage ?? null,
  );
  expect(apiComponentAtlas.validationStatus).toEqual(testFile.validationStatus);
  expect(apiComponentAtlas.validationSummary).toEqual(
    normalizeValidationSummary(testFile.validationSummary),
  );
  expect(apiComponentAtlas.wipNumber).toEqual(
    testComponentAtlas.wipNumber ?? 1,
  );

  if (expectDetail) {
    expect(apiComponentAtlas).toHaveProperty("validationReports");
  } else {
    expect(apiComponentAtlas).not.toHaveProperty("validationReports");
  }

  doAdditionalChecks?.(testFile);
}

export function expectApiEntityToMatchLinkedAtlases(
  apiEntity: LinkedAtlasFields & { atlasId?: string },
  expectedPrimaryAtlases: TestAtlas[],
  expectedOtherAtlases: TestAtlas[],
  expectedLatestAtlasIds: string[],
  expectedAtlasId?: string,
): void {
  if (expectedAtlasId === undefined) {
    expect(apiEntity.atlasId).toBeUndefined();
  } else {
    expect(apiEntity.atlasId).toEqual(expectedAtlasId);
  }

  expect(apiEntity.atlases).toHaveLength(
    expectedPrimaryAtlases.length + expectedOtherAtlases.length,
  );

  const expectedNames = new Set<string>();
  const expectedShortNames = new Set<string>();
  const expectedVersions = new Set<string>();
  const expectedNetworks = new Set<NetworkKey>();
  const addFieldValues = (atlas: TestAtlas): void => {
    const version = `${atlas.generation}.${atlas.revision}`;
    expectedNames.add(`${atlas.shortName} v${version}`);
    expectedShortNames.add(atlas.shortName);
    expectedVersions.add(version);
    expectedNetworks.add(atlas.network);
  };
  for (const testAtlas of expectedPrimaryAtlases) {
    const linkedAtlas = apiEntity.atlases.find((a) => a.id === testAtlas.id);
    assertExpectDefined(linkedAtlas);
    expectLinkedAtlasSummaryToMatchTestAtlas(
      linkedAtlas,
      testAtlas,
      expectedLatestAtlasIds.includes(testAtlas.id),
      true,
    );
    addFieldValues(testAtlas);
  }
  for (const testAtlas of expectedOtherAtlases) {
    const linkedAtlas = apiEntity.atlases.find((a) => a.id === testAtlas.id);
    assertExpectDefined(linkedAtlas);
    expectLinkedAtlasSummaryToMatchTestAtlas(
      linkedAtlas,
      testAtlas,
      expectedLatestAtlasIds.includes(testAtlas.id),
      false,
    );
    addFieldValues(testAtlas);
  }

  expectStringArrayToUnorderedEqual(
    apiEntity.atlasNames,
    Array.from(expectedNames),
  );
  expectStringArrayToUnorderedEqual(
    apiEntity.atlasShortNames,
    Array.from(expectedShortNames),
  );
  expectStringArrayToUnorderedEqual(
    apiEntity.atlasVersions,
    Array.from(expectedVersions),
  );
  expectStringArrayToUnorderedEqual(
    apiEntity.networks,
    Array.from(expectedNetworks),
  );
}

function expectLinkedAtlasSummaryToMatchTestAtlas(
  linkedAtlas: LinkedAtlasSummary,
  testAtlas: TestAtlas,
  expectedIsLatest: boolean,
  expectedIsPrimary: boolean,
): void {
  expect(linkedAtlas).toEqual({
    generation: testAtlas.generation,
    id: testAtlas.id,
    isLatest: expectedIsLatest,
    isPrimary: expectedIsPrimary,
    network: testAtlas.network,
    revision: testAtlas.revision,
    shortName: testAtlas.shortName,
  } satisfies LinkedAtlasSummary);
}

export function expectApiValidationsToMatchDb(
  apiValidations: HCAAtlasTrackerValidationRecordWithoutAtlases[],
  dbValidations: HCAAtlasTrackerDBValidation[],
): void {
  expect(apiValidations).toHaveLength(dbValidations.length);
  for (const apiValidation of apiValidations) {
    const dbValidation = dbValidations.find((v) => v.id === apiValidation.id);
    if (!expectIsDefined(dbValidation)) continue;
    expect(apiValidation.commentThreadId).toEqual(
      dbValidation.comment_thread_id,
    );
    expect(apiValidation.createdAt).toEqual(
      dbValidation.created_at.toISOString(),
    );
    expect(apiValidation.description).toEqual(
      dbValidation.validation_info.description,
    );
    expect(apiValidation.differences).toEqual(
      dbValidation.validation_info.differences,
    );
    expect(apiValidation.doi).toEqual(dbValidation.validation_info.doi);
    expect(apiValidation.entityId).toEqual(dbValidation.entity_id);
    expect(apiValidation.entityTitle).toEqual(
      dbValidation.validation_info.entityTitle,
    );
    expect(apiValidation.entityType).toEqual(
      dbValidation.validation_info.entityType,
    );
    expect(apiValidation.publicationString).toEqual(
      dbValidation.validation_info.publicationString,
    );
    expect(apiValidation.relatedEntityUrl).toEqual(
      dbValidation.validation_info.relatedEntityUrl,
    );
    expect(apiValidation.resolvedAt).toEqual(
      dbValidation.resolved_at?.toISOString() ?? null,
    );
    expect(apiValidation.system).toEqual(dbValidation.validation_info.system);
    expect(apiValidation.targetCompletion).toEqual(
      dbValidation.target_completion?.toISOString() ?? null,
    );
    expect(apiValidation.taskStatus).toEqual(
      dbValidation.validation_info.taskStatus,
    );
    expect(apiValidation.updatedAt).toEqual(
      dbValidation.updated_at.toISOString(),
    );
    expect(apiValidation.validationId).toEqual(dbValidation.validation_id);
    expect(apiValidation.validationStatus).toEqual(
      dbValidation.validation_info.validationStatus,
    );
    expect(apiValidation.validationType).toEqual(
      dbValidation.validation_info.validationType,
    );
  }
}

export function expectApiUserToMatchTest(
  apiUser: HCAAtlasTrackerUser,
  testUser: TestUser,
): void {
  expect(apiUser.disabled).toEqual(testUser.disabled);
  expect(apiUser.email).toEqual(testUser.email);
  expect(apiUser.fullName).toEqual(testUser.name);
  expect(apiUser.role).toEqual(testUser.role);
  expect(apiUser.roleAssociatedResourceIds).toEqual(
    testUser.roleAssociatedResourceIds,
  );
}

export async function expectDbUserToMatchInputData(
  dbUser: HCAAtlasTrackerDBUser,
  inputData: NewUserData | UserEditData,
): Promise<void> {
  expect(dbUser.disabled).toEqual(inputData.disabled);
  expect(dbUser.email).toEqual(inputData.email);
  expect(dbUser.full_name).toEqual(inputData.fullName);
  expect(dbUser.role).toEqual(inputData.role);
  expect(dbUser.role_associated_resource_ids).toEqual(
    inputData.roleAssociatedResourceIds,
  );
}

function expectedFilePublishedStatus(
  publishedAt: string | null | undefined,
): FILE_PUBLISHED_STATUS {
  return publishedAt == null
    ? FILE_PUBLISHED_STATUS.WIP
    : FILE_PUBLISHED_STATUS.PUBLISHED;
}

function expectStringArrayToUnorderedEqual(
  actual: string[],
  expected: string[],
): void {
  expect(actual.toSorted()).toEqual(expected.toSorted());
}

export function assertExpectDefined<T>(
  value: T | undefined,
): asserts value is T {
  expectIsDefined(value);
}

export function expectIsDefined<T>(value: T | undefined): value is T {
  expect(value).toBeDefined();
  return value !== undefined;
}

export function expectIsInstanceOf<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Required to work with InstanceType
  T extends abstract new (...args: any[]) => any,
>(value: unknown, checkClass: T): value is InstanceType<T> {
  expect(value).toBeInstanceOf(checkClass);
  return value instanceof checkClass;
}
