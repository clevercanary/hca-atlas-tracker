import migrate from "node-pg-migrate";
import { MigrationDirection } from "node-pg-migrate/dist/types";
import pg from "pg";
import { ProjectsResponse } from "../app/apis/azul/hca-dcp/common/responses";
import {
  DOI_STATUS,
  HCAAtlasTrackerDBAtlasOverview,
  HCAAtlasTrackerDBPublishedSourceDatasetInfo,
  HCAAtlasTrackerDBUnpublishedSourceDatasetInfo,
  ROLE,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { getPoolConfig } from "../app/utils/__mocks__/pg-app-connect-config";
import {
  INITIAL_TEST_ATLASES,
  INITIAL_TEST_SOURCE_DATASETS,
  INITIAL_TEST_USERS,
  TEST_CELLXGENE_COLLECTIONS_BY_DOI,
  TEST_HCA_PROJECTS_BY_DOI,
} from "./constants";
import { TestAtlas, TestSourceDataset, TestUser } from "./entities";

export async function resetDatabase(): Promise<void> {
  const consoleInfoSpy = jest.spyOn(console, "info").mockImplementation();
  const poolConfig = getPoolConfig();
  const pool = new pg.Pool(poolConfig);
  const client = await pool.connect();
  await runMigrations("down", client);
  await runMigrations("up", client);
  await initDatabaseEntries(client);
  client.release();
  pool.end();
  consoleInfoSpy.mockRestore();
}

async function initDatabaseEntries(client: pg.PoolClient): Promise<void> {
  for (const user of INITIAL_TEST_USERS) {
    await client.query(
      "INSERT INTO hat.users (disabled, email, full_name, role) VALUES ($1, $2, $3, $4)",
      [user.disabled.toString(), user.email, user.name, user.role]
    );
  }

  for (const dataset of INITIAL_TEST_SOURCE_DATASETS) {
    const sdInfo = makeTestSourceDatasetOverview(dataset);
    await client.query(
      "INSERT INTO hat.source_datasets (doi, id, sd_info) VALUES ($1, $2, $3)",
      [
        "doi" in dataset ? dataset.doi : null,
        dataset.id,
        JSON.stringify(sdInfo),
      ]
    );
  }

  for (const atlas of INITIAL_TEST_ATLASES) {
    const overview = makeTestAtlasOverview(atlas);
    await client.query(
      "INSERT INTO hat.atlases (id, overview, source_datasets, status) VALUES ($1, $2, $3, $4)",
      [
        atlas.id,
        JSON.stringify(overview),
        JSON.stringify(atlas.sourceDatasets || []),
        atlas.status,
      ]
    );
  }
}

async function runMigrations(
  direction: MigrationDirection,
  client: pg.PoolClient
): Promise<void> {
  await client.query("CREATE SCHEMA IF NOT EXISTS hat");
  await migrate({
    count: Infinity,
    dbClient: client,
    dir: "migrations",
    direction,
    migrationsTable: "pgmigrations",
    schema: "hat",
  });
}

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
):
  | HCAAtlasTrackerDBPublishedSourceDatasetInfo
  | HCAAtlasTrackerDBUnpublishedSourceDatasetInfo {
  return "unpublishedInfo" in dataset
    ? {
        cellxgeneCollectionId: dataset.cellxgeneCollectionId,
        doiStatus: DOI_STATUS.NA,
        hcaProjectId: dataset.hcaProjectId,
        publication: null,
        unpublishedInfo: dataset.unpublishedInfo,
      }
    : {
        cellxgeneCollectionId:
          (dataset.doi &&
            TEST_CELLXGENE_COLLECTIONS_BY_DOI.get(dataset.doi)
              ?.collection_id) ??
          null,
        doiStatus: dataset.doiStatus,
        hcaProjectId:
          (dataset.doi &&
            TEST_HCA_PROJECTS_BY_DOI.get(dataset.doi)?.projects[0].projectId) ??
          null,
        publication: dataset.publication,
        unpublishedInfo: null,
      };
}

export function makeTestProjectsResponse(
  id: string,
  doi: string,
  title: string
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
