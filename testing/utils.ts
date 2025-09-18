import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { ProjectsResponse } from "../app/apis/azul/hca-dcp/common/responses";
import {
  DOI_STATUS,
  FILE_STATUS,
  FILE_TYPE,
  HCAAtlasTrackerAtlas,
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
  HCAAtlasTrackerSourceDataset,
  HCAAtlasTrackerSourceStudy,
  HCAAtlasTrackerUser,
  HCAAtlasTrackerValidationRecordWithoutAtlases,
  INTEGRITY_STATUS,
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
import {
  ATLAS_DRAFT,
  DEFAULT_USERS_BY_ROLE,
  INTEGRATION_LEADS_BY_ATLAS_ID,
  TEST_CELLXGENE_COLLECTIONS_BY_DOI,
  TEST_HCA_PROJECTS_BY_DOI,
  USER_INTEGRATION_LEAD_DRAFT,
  USER_INTEGRATION_LEAD_PUBLIC,
} from "./constants";
import {
  NormalizedTestFile,
  TestAtlas,
  TestComponentAtlas,
  TestFile,
  TestSourceDataset,
  TestSourceStudy,
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
        metadataSpreadsheets: study.metadataSpreadsheets ?? [],
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
        metadataSpreadsheets: study.metadataSpreadsheets ?? [],
        publication: study.publication,
        unpublishedInfo: null,
      };
}

export function makeTestSourceDatasetInfo(
  sourceDataset: TestSourceDataset
): HCAAtlasTrackerDBSourceDatasetInfo {
  return {
    assay: sourceDataset.assay ?? [],
    cellCount: sourceDataset.cellCount ?? 0,
    cellxgeneDatasetId: sourceDataset.cellxgeneDatasetId ?? null,
    cellxgeneDatasetVersion: sourceDataset.cellxgeneDatasetVersion ?? null,
    cellxgeneExplorerUrl: sourceDataset.cellxgeneDatasetId
      ? `explorer-url-${sourceDataset.cellxgeneDatasetId}`
      : null,
    disease: sourceDataset.disease ?? [],
    metadataSpreadsheetTitle: sourceDataset.metadataSpreadsheetTitle ?? null,
    metadataSpreadsheetUrl: sourceDataset.metadataSpreadsheetUrl ?? null,
    suspensionType: sourceDataset.suspensionType ?? [],
    tissue: sourceDataset.tissue ?? [],
    title: sourceDataset.title,
  };
}

export function makeTestProjectsResponse(
  id: string,
  doi: string,
  title: string,
  fileFormats = ["fastq"],
  atlases?: { shortName: string; version: string }[],
  networks?: string[]
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

export function getNormalizedFileForTestEntity(
  testEntity: TestSourceDataset | TestComponentAtlas
): NormalizedTestFile {
  return fillTestFileDefaults(getLatestFileForTestEntity(testEntity));
}

export function getLatestFileForTestEntity(
  testEntity: TestSourceDataset | TestComponentAtlas
): TestFile {
  const testFile = getTestEntityFilesArray(testEntity).find(
    (f) => f.isLatest !== false
  );
  if (!testFile)
    throw new Error(`Test entity ${testEntity.id} has no latest file`);
  return testFile;
}

export function getTestEntityFilesArray(
  testEntity: TestSourceDataset | TestComponentAtlas
): TestFile[] {
  return testEntity.file
    ? Array.isArray(testEntity.file)
      ? testEntity.file
      : [testEntity.file]
    : [];
}

export function fillTestFileDefaults(file: TestFile): NormalizedTestFile {
  const {
    atlas,
    datasetInfo = null,
    eventName = "ObjectCreated:*",
    integrityCheckedAt = null,
    integrityError = null,
    integrityStatus = INTEGRITY_STATUS.PENDING,
    isLatest = true,
    sha256Client = null,
    sha256Server = null,
    sourceStudyId = null,
    status = FILE_STATUS.UPLOADED,
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
    integrityError,
    integrityStatus,
    isLatest,
    resolvedAtlas,
    sha256Client,
    sha256Server,
    sourceStudyId,
    status,
    validationInfo,
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
  return `${atlas.network}/${atlas.shortName}-v${atlas.version.replaceAll(
    ".",
    "-"
  )}/${folderName}/${file.fileName}`;
}

export function aggregateSourceDatasetArrayField(
  sourceDatasets: TestSourceDataset[] | undefined,
  field: "assay" | "disease" | "suspensionType" | "tissue"
): string[] {
  if (!sourceDatasets) return [];
  return Array.from(new Set(sourceDatasets.map((d) => d[field] ?? []).flat()));
}

export function getTestSourceStudyCitation(
  sourceStudy: TestSourceStudy
): string {
  if ("doi" in sourceStudy) {
    return getPublishedCitation(
      sourceStudy.doiStatus,
      sourceStudy.publication?.authors[0].name ?? null,
      sourceStudy.publication?.publicationDate ?? null,
      sourceStudy.publication?.journal ?? null
    );
  } else {
    return getUnpublishedCitation(
      sourceStudy.unpublishedInfo.referenceAuthor,
      sourceStudy.unpublishedInfo.contactEmail
    );
  }
}

export function withConsoleErrorHiding<T>(
  fn: () => Promise<T>,
  hideConsoleError = true,
  errorsOutputArray?: unknown[][]
): Promise<T> {
  return withConsoleMessageHiding(
    fn,
    hideConsoleError,
    { error: errorsOutputArray },
    ["error"]
  );
}

export async function withConsoleMessageHiding<T>(
  fn: () => Promise<T>,
  enableHiding = true,
  outputArrays?: Partial<Record<ConsoleMessageFunctionName, unknown[][]>>,
  messageTypes: readonly ConsoleMessageFunctionName[] = CONSOLE_MESSAGE_FUNCTION_NAMES
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
    user: TestUser
  ) => void | Promise<void>
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
      }
    );
    await withConsoleErrorHiding(() => handler(req, res), hideConsoleError);
    await callback(res, user);
  });
}

export function expectApiAtlasToMatchTest(
  apiAtlas: HCAAtlasTrackerAtlas,
  testAtlas: TestAtlas
): void {
  expect(apiAtlas.cellxgeneAtlasCollection).toEqual(
    testAtlas.cellxgeneAtlasCollection
  );
  expect(apiAtlas.codeLinks).toEqual(testAtlas.codeLinks);
  expect(apiAtlas.description).toEqual(testAtlas.description);
  expect(apiAtlas.highlights).toEqual(testAtlas.highlights);
  expect(apiAtlas.id).toEqual(testAtlas.id);
  expect(apiAtlas.integrationLead).toEqual(testAtlas.integrationLead);
  expect(apiAtlas.bioNetwork).toEqual(testAtlas.network);
  expect(apiAtlas.publications).toEqual(testAtlas.publications);
  expect(apiAtlas.shortName).toEqual(testAtlas.shortName);
  expect(apiAtlas.sourceStudyCount).toEqual(testAtlas.sourceStudies.length);
  expect(apiAtlas.status).toEqual(testAtlas.status);
  expect(apiAtlas.targetCompletion).toEqual(
    testAtlas.targetCompletion?.toISOString() ?? null
  );
  expect(apiAtlas.version).toEqual(testAtlas.version);
  expect(apiAtlas.wave).toEqual(testAtlas.wave);
}

export function expectDbAtlasToMatchApi(
  dbAtlas: HCAAtlasTrackerDBAtlas,
  apiAtlas: HCAAtlasTrackerAtlas,
  expectedComponentAtlasCount = 0
): void {
  expect(dbAtlas.overview.network).toEqual(apiAtlas.bioNetwork);
  expect(dbAtlas.overview.completedTaskCount).toEqual(
    apiAtlas.completedTaskCount
  );
  expect(dbAtlas.id).toEqual(apiAtlas.id);
  expect(dbAtlas.overview.integrationLead).toEqual(apiAtlas.integrationLead);
  expect(dbAtlas.overview.shortName).toEqual(apiAtlas.shortName);
  expect(dbAtlas.overview.publications).toEqual(apiAtlas.publications);
  expect(dbAtlas.source_studies).toHaveLength(apiAtlas.sourceStudyCount);
  expect(dbAtlas.status).toEqual(apiAtlas.status);
  expect(dbAtlas.target_completion?.toISOString() ?? null).toEqual(
    apiAtlas.targetCompletion
  );
  expect(dbAtlas.overview.taskCount).toEqual(apiAtlas.taskCount);
  expect(dbAtlas.overview.version).toEqual(apiAtlas.version);
  expect(dbAtlas.overview.wave).toEqual(apiAtlas.wave);
  expect(apiAtlas.componentAtlasCount).toEqual(expectedComponentAtlasCount);
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

export function expectApiSourceDatasetsToMatchTest(
  apiSourceDatasets: HCAAtlasTrackerSourceDataset[],
  testSourceDatasets: TestSourceDataset[]
): void {
  expect(apiSourceDatasets).toHaveLength(testSourceDatasets.length);
  for (const testSourceDataset of testSourceDatasets) {
    const apiSourceDataset = apiSourceDatasets.find(
      (c) => c.id === testSourceDataset.id
    );
    if (!expectIsDefined(apiSourceDataset)) continue;
    expectApiSourceDatasetToMatchTest(apiSourceDataset, testSourceDataset);
  }
}

export function expectApiSourceDatasetToMatchTest(
  apiSourceDataset: HCAAtlasTrackerSourceDataset,
  testSourceDataset: TestSourceDataset
): void {
  if (!expectIsDefined(testSourceDataset.file)) return;
  const testFile = getNormalizedFileForTestEntity(testSourceDataset);

  expect(apiSourceDataset.assay).toEqual(testFile.datasetInfo?.assay ?? []);
  expect(apiSourceDataset.cellCount).toEqual(
    testFile.datasetInfo?.cellCount ?? 0
  );
  expect(apiSourceDataset.cellxgeneDatasetId).toEqual(
    testSourceDataset.cellxgeneDatasetId ?? null
  );
  expect(apiSourceDataset.cellxgeneDatasetVersion).toEqual(
    testSourceDataset.cellxgeneDatasetVersion ?? null
  );
  expect(apiSourceDataset.disease).toEqual(testFile.datasetInfo?.disease ?? []);
  expect(apiSourceDataset.reprocessedStatus).toEqual(
    testSourceDataset.reprocessedStatus ?? REPROCESSED_STATUS.UNSPECIFIED
  );
  expect(apiSourceDataset.sourceStudyId).toEqual(
    testSourceDataset.sourceStudyId ?? null
  );
  expect(apiSourceDataset.suspensionType).toEqual(
    testFile.datasetInfo?.suspensionType ?? []
  );
  expect(apiSourceDataset.tissue).toEqual(testFile.datasetInfo?.tissue ?? []);
  expect(apiSourceDataset.title).toEqual(testFile.datasetInfo?.title ?? "");
}

export function expectDbSourceDatasetToMatchTest(
  dbSourceDataset: HCAAtlasTrackerDBSourceDataset,
  testSourceDataset: TestSourceDataset
): void {
  expect(dbSourceDataset.sd_info.assay).toEqual(testSourceDataset.assay ?? []);
  expect(dbSourceDataset.sd_info.cellCount).toEqual(
    testSourceDataset.cellCount ?? 0
  );
  expect(dbSourceDataset.sd_info.cellxgeneDatasetId).toEqual(
    testSourceDataset.cellxgeneDatasetId ?? null
  );
  expect(dbSourceDataset.sd_info.cellxgeneDatasetVersion).toEqual(
    testSourceDataset.cellxgeneDatasetVersion ?? null
  );
  expect(dbSourceDataset.sd_info.disease).toEqual(
    testSourceDataset.disease ?? []
  );
  expect(dbSourceDataset.reprocessed_status).toEqual(
    testSourceDataset.reprocessedStatus ?? REPROCESSED_STATUS.UNSPECIFIED
  );
  expect(dbSourceDataset.source_study_id).toEqual(
    testSourceDataset.sourceStudyId ?? null
  );
  expect(dbSourceDataset.sd_info.suspensionType).toEqual(
    testSourceDataset.suspensionType ?? []
  );
  expect(dbSourceDataset.sd_info.tissue).toEqual(
    testSourceDataset.tissue ?? []
  );
  expect(dbSourceDataset.sd_info.title).toEqual(testSourceDataset.title);
}

export function expectApiComponentAtlasToMatchTest(
  apiComponentAtlas: HCAAtlasTrackerComponentAtlas,
  testComponentAtlas: TestComponentAtlas
): void {
  if (!expectIsDefined(testComponentAtlas.file)) return;
  const testFile = getNormalizedFileForTestEntity(testComponentAtlas);

  expect(apiComponentAtlas.atlasId).toEqual(testFile.resolvedAtlas.id);
  expect(apiComponentAtlas.fileName).toEqual(testFile.fileName);
  expect(apiComponentAtlas.integrityStatus).toEqual(testFile.integrityStatus);
  expect(apiComponentAtlas.sizeBytes).toEqual(Number(testFile.sizeBytes));
  expect(apiComponentAtlas.title).toEqual(testFile.datasetInfo?.title ?? "");
  expect(apiComponentAtlas.cellCount).toEqual(
    testFile.datasetInfo?.cellCount ?? 0
  );
  expect(apiComponentAtlas.assay).toEqual(testFile.datasetInfo?.assay ?? []);
  expect(apiComponentAtlas.disease).toEqual(
    testFile.datasetInfo?.disease ?? []
  );
  expect(apiComponentAtlas.suspensionType).toEqual(
    testFile.datasetInfo?.suspensionType ?? []
  );
  expect(apiComponentAtlas.tissue).toEqual(testFile.datasetInfo?.tissue ?? []);

  // TODO: check for test component atlas fields once they're included
}

export function expectAtlasDatasetsToHaveDifference(
  atlasWithout: HCAAtlasTrackerDBAtlas,
  atlasWith: HCAAtlasTrackerDBAtlas,
  sourceDatasets: TestSourceDataset[]
): void {
  expectArrayToContainItems(
    atlasWith.source_datasets,
    atlasWithout.source_datasets
  );
  for (const { id } of sourceDatasets) {
    expect(atlasWithout.source_datasets).not.toContain(id);
  }
}

export function expectApiValidationsToMatchDb(
  apiValidations: HCAAtlasTrackerValidationRecordWithoutAtlases[],
  dbValidations: HCAAtlasTrackerDBValidation[]
): void {
  expect(apiValidations).toHaveLength(dbValidations.length);
  for (const apiValidation of apiValidations) {
    const dbValidation = dbValidations.find((v) => v.id === apiValidation.id);
    if (!expectIsDefined(dbValidation)) continue;
    expect(apiValidation.commentThreadId).toEqual(
      dbValidation.comment_thread_id
    );
    expect(apiValidation.createdAt).toEqual(
      dbValidation.created_at.toISOString()
    );
    expect(apiValidation.description).toEqual(
      dbValidation.validation_info.description
    );
    expect(apiValidation.differences).toEqual(
      dbValidation.validation_info.differences
    );
    expect(apiValidation.doi).toEqual(dbValidation.validation_info.doi);
    expect(apiValidation.entityId).toEqual(dbValidation.entity_id);
    expect(apiValidation.entityTitle).toEqual(
      dbValidation.validation_info.entityTitle
    );
    expect(apiValidation.entityType).toEqual(
      dbValidation.validation_info.entityType
    );
    expect(apiValidation.publicationString).toEqual(
      dbValidation.validation_info.publicationString
    );
    expect(apiValidation.relatedEntityUrl).toEqual(
      dbValidation.validation_info.relatedEntityUrl
    );
    expect(apiValidation.resolvedAt).toEqual(
      dbValidation.resolved_at?.toISOString() ?? null
    );
    expect(apiValidation.system).toEqual(dbValidation.validation_info.system);
    expect(apiValidation.targetCompletion).toEqual(
      dbValidation.target_completion?.toISOString() ?? null
    );
    expect(apiValidation.taskStatus).toEqual(
      dbValidation.validation_info.taskStatus
    );
    expect(apiValidation.updatedAt).toEqual(
      dbValidation.updated_at.toISOString()
    );
    expect(apiValidation.validationId).toEqual(dbValidation.validation_id);
    expect(apiValidation.validationStatus).toEqual(
      dbValidation.validation_info.validationStatus
    );
    expect(apiValidation.validationType).toEqual(
      dbValidation.validation_info.validationType
    );
  }
}

export function expectApiUserToMatchTest(
  apiUser: HCAAtlasTrackerUser,
  testUser: TestUser
): void {
  expect(apiUser.disabled).toEqual(testUser.disabled);
  expect(apiUser.email).toEqual(testUser.email);
  expect(apiUser.fullName).toEqual(testUser.name);
  expect(apiUser.role).toEqual(testUser.role);
  expect(apiUser.roleAssociatedResourceIds).toEqual(
    testUser.roleAssociatedResourceIds
  );
}

export async function expectDbUserToMatchInputData(
  dbUser: HCAAtlasTrackerDBUser,
  inputData: NewUserData | UserEditData
): Promise<void> {
  expect(dbUser.disabled).toEqual(inputData.disabled);
  expect(dbUser.email).toEqual(inputData.email);
  expect(dbUser.full_name).toEqual(inputData.fullName);
  expect(dbUser.role).toEqual(inputData.role);
  expect(dbUser.role_associated_resource_ids).toEqual(
    inputData.roleAssociatedResourceIds
  );
}

function expectArrayToContainItems(array: unknown[], items: unknown[]): void {
  for (const item of items) {
    expect(array).toContain(item);
  }
}

export function expectIsDefined<T>(value: T | undefined): value is T {
  expect(value).toBeDefined();
  return value !== undefined;
}

export function expectIsInstanceOf<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Required to work with InstanceType
  T extends abstract new (...args: any[]) => any
>(value: unknown, checkClass: T): value is InstanceType<T> {
  expect(value).toBeInstanceOf(checkClass);
  return value instanceof checkClass;
}
