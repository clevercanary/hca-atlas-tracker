import { ProjectsResponse } from "../app/apis/azul/hca-dcp/common/responses";
import {
  DOI_STATUS,
  HCAAtlasTrackerDBAtlasOverview,
  HCAAtlasTrackerDBPublishedSourceStudyInfo,
  HCAAtlasTrackerDBUnpublishedSourceStudyInfo,
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
  disabled = false
): TestUser {
  return {
    authorization: `Bearer ${nameId}`,
    disabled,
    email: `${nameId}@example.com`,
    name: nameId,
    role,
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
          (study.doi &&
            TEST_CELLXGENE_COLLECTIONS_BY_DOI.get(study.doi)?.collection_id) ??
          null,
        doiStatus: study.doiStatus,
        hcaProjectId:
          (study.doi &&
            TEST_HCA_PROJECTS_BY_DOI.get(study.doi)?.projects[0].projectId) ??
          null,
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
