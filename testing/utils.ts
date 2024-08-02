import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { ProjectsResponse } from "../app/apis/azul/hca-dcp/common/responses";
import {
  DOI_STATUS,
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerDBAtlasOverview,
  HCAAtlasTrackerDBComponentAtlas,
  HCAAtlasTrackerDBPublishedSourceStudyInfo,
  HCAAtlasTrackerDBSourceDatasetInfo,
  HCAAtlasTrackerDBSourceStudy,
  HCAAtlasTrackerDBUnpublishedSourceStudyInfo,
  HCAAtlasTrackerDBValidation,
  HCAAtlasTrackerSourceStudy,
  HCAAtlasTrackerUser,
  HCAAtlasTrackerValidationRecordWithoutAtlases,
  ROLE,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
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
  TestAtlas,
  TestSourceDataset,
  TestSourceStudy,
  TestUser,
} from "./entities";

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
    description: atlas.description,
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
    suspensionType: sourceDataset.suspensionType ?? [],
    tissue: sourceDataset.tissue ?? [],
    title: sourceDataset.title,
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

export function aggregateSourceDatasetArrayField(
  sourceDatasets: TestSourceDataset[] | undefined,
  field: "assay" | "disease" | "suspensionType" | "tissue"
): string[] {
  if (!sourceDatasets) return [];
  return Array.from(new Set(sourceDatasets.map((d) => d[field] ?? []).flat()));
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

export function testApiRole(
  testNameBase: string,
  route: string,
  handler: Handler,
  method: METHOD,
  role: ROLE,
  query: Record<string, string> | undefined,
  body: httpMocks.Body | undefined,
  hideConsoleError: boolean,
  callback: (
    res: httpMocks.MockResponse<NextApiResponse>,
    user: TestUser
  ) => void | Promise<void>
): void {
  let user: TestUser;
  let testName: string;
  if (role === ROLE.INTEGRATION_LEAD && query && "atlasId" in query) {
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
        query,
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
  expect(apiAtlas.description).toEqual(testAtlas.description);
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

export function expectComponentAtlasDatasetsToHaveDifference(
  componentAtlasWithout: HCAAtlasTrackerDBComponentAtlas,
  componentAtlasWith: HCAAtlasTrackerDBComponentAtlas,
  sourceDatasets: TestSourceDataset[]
): void {
  const infoWithout = componentAtlasWithout.component_info;
  const infoWith = componentAtlasWith.component_info;
  const expectedCellCountDiff = sourceDatasets.reduce(
    (sum, d) => sum + (d.cellCount ?? 0),
    0
  );
  expect(infoWith.cellCount - infoWithout.cellCount).toEqual(
    expectedCellCountDiff
  );
  expectArrayToContainItems(infoWith.assay, infoWithout.assay);
  expectArrayToContainItems(infoWith.disease, infoWithout.disease);
  expectArrayToContainItems(
    infoWith.suspensionType,
    infoWithout.suspensionType
  );
  expectArrayToContainItems(infoWith.tissue, infoWithout.tissue);
  for (const sourceDataset of sourceDatasets) {
    expectArrayToContainItems(infoWith.assay, sourceDataset.assay ?? []);
    expectArrayToContainItems(infoWith.disease, sourceDataset.disease ?? []);
    expectArrayToContainItems(
      infoWith.suspensionType,
      sourceDataset.suspensionType ?? []
    );
    expectArrayToContainItems(infoWith.tissue, sourceDataset.tissue ?? []);
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

function expectArrayToContainItems(array: unknown[], items: unknown[]): void {
  for (const item of items) {
    expect(array).toContain(item);
  }
}

export function expectIsDefined<T>(value: T | undefined): value is T {
  expect(value).toBeDefined();
  return value !== undefined;
}
