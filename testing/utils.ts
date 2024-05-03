import { ProjectsResponse } from "../app/apis/azul/hca-dcp/common/responses";
import {
  HCAAtlasTrackerDBAtlasOverview,
  HCAAtlasTrackerDBPublishedSourceDatasetInfo,
  ROLE,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { TestAtlas, TestSourceDataset, TestUser } from "./entities";

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
    integrationLead: atlas.integrationLead,
    network: atlas.network,
    shortName: atlas.shortName,
    version: atlas.version,
    wave: atlas.wave,
  };
}

export function makeTestSourceDatasetOverview(
  dataset: TestSourceDataset
): HCAAtlasTrackerDBPublishedSourceDatasetInfo {
  return {
    cellxgeneCollectionId: null,
    doiStatus: dataset.doiStatus,
    hcaProjectId: null,
    publication: dataset.publication,
    unpublishedInfo: null,
  };
}

export function makeTestProjectsResponse(
  id: string,
  doi: string
): ProjectsResponse {
  return {
    cellSuspensions: [],
    donorOrganisms: [],
    fileTypeSummaries: [],
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
        projectTitle: "",
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
