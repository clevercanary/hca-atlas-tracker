import migrate from "node-pg-migrate";
import { MigrationDirection } from "node-pg-migrate/dist/types";
import pg from "pg";
import {
  HCAAtlasTrackerDBComponentAtlasInfo,
  HCAAtlasTrackerDBSourceDatasetInfo,
  HCAAtlasTrackerDBSourceStudy,
  HCAAtlasTrackerDBValidation,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { updateTaskCounts } from "../app/services/atlases";
import { query } from "../app/services/database";
import { updateSourceStudyValidations } from "../app/services/validations";
import { getPoolConfig } from "../app/utils/__mocks__/pg-app-connect-config";
import {
  INITIAL_TEST_ATLASES,
  INITIAL_TEST_COMPONENT_ATLASES,
  INITIAL_TEST_SOURCE_DATASETS,
  INITIAL_TEST_SOURCE_STUDIES,
  INITIAL_TEST_USERS,
} from "./constants";
import { makeTestAtlasOverview, makeTestSourceStudyOverview } from "./utils";

export async function resetDatabase(): Promise<void> {
  const consoleInfoSpy = jest.spyOn(console, "info").mockImplementation();
  const poolConfig = getPoolConfig();
  const pool = new pg.Pool(poolConfig);
  const client = await pool.connect();
  await runMigrations("down", client);
  await runMigrations("up", client);
  await initDatabaseEntries(client);
  client.release();
  await pool.end();
  consoleInfoSpy.mockRestore();
}

async function initDatabaseEntries(client: pg.PoolClient): Promise<void> {
  for (const user of INITIAL_TEST_USERS) {
    await client.query(
      "INSERT INTO hat.users (disabled, email, full_name, role) VALUES ($1, $2, $3, $4)",
      [user.disabled.toString(), user.email, user.name, user.role]
    );
  }

  for (const study of INITIAL_TEST_SOURCE_STUDIES) {
    const sdInfo = makeTestSourceStudyOverview(study);
    await client.query(
      "INSERT INTO hat.source_studies (doi, id, study_info) VALUES ($1, $2, $3)",
      ["doi" in study ? study.doi : null, study.id, JSON.stringify(sdInfo)]
    );
  }

  for (const sourceDataset of INITIAL_TEST_SOURCE_DATASETS) {
    const info: HCAAtlasTrackerDBSourceDatasetInfo = {
      cellCount: 0,
      cellxgeneDatasetId: sourceDataset.cellxgeneDatasetId ?? null,
      cellxgeneDatasetVersion: sourceDataset.cellxgeneDatasetVersion ?? null,
      title: sourceDataset.title,
    };
    await client.query(
      "INSERT INTO hat.source_datasets (source_study_id, sd_info, id) VALUES ($1, $2, $3)",
      [sourceDataset.sourceStudyId, info, sourceDataset.id]
    );
  }

  for (const atlas of INITIAL_TEST_ATLASES) {
    const overview = makeTestAtlasOverview(atlas);
    await client.query(
      "INSERT INTO hat.atlases (id, overview, source_studies, status, target_completion) VALUES ($1, $2, $3, $4, $5)",
      [
        atlas.id,
        JSON.stringify(overview),
        JSON.stringify(atlas.sourceStudies || []),
        atlas.status,
        atlas.targetCompletion ?? null,
      ]
    );
  }

  for (const componentAtlas of INITIAL_TEST_COMPONENT_ATLASES) {
    const info: HCAAtlasTrackerDBComponentAtlasInfo = {
      cellxgeneDatasetId: null,
      cellxgeneDatasetVersion: null,
    };
    await client.query(
      "INSERT INTO hat.component_atlases (atlas_id, component_info, id, source_datasets, title) VALUES ($1, $2, $3, $4, $5)",
      [
        componentAtlas.atlasId,
        info,
        componentAtlas.id,
        componentAtlas.sourceDatasets ?? [],
        componentAtlas.title,
      ]
    );
  }

  const dbSourceStudies = (
    await client.query<HCAAtlasTrackerDBSourceStudy>(
      "SELECT * FROM hat.source_studies"
    )
  ).rows;
  for (const study of dbSourceStudies) {
    await updateSourceStudyValidations(study, client);
  }

  await updateTaskCounts();
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

export async function getExistingSourceStudyFromDatabase(
  id: string
): Promise<HCAAtlasTrackerDBSourceStudy> {
  const result = (
    await query<HCAAtlasTrackerDBSourceStudy>(
      "SELECT * FROM hat.source_studies WHERE id=$1",
      [id]
    )
  ).rows[0];
  if (!result) throw new Error(`Source dataset ${id} doesn't exist`);
  return result;
}

export async function getValidationsByEntityId(
  id: string
): Promise<HCAAtlasTrackerDBValidation[]> {
  return (
    await query<HCAAtlasTrackerDBValidation>(
      "SELECT * FROM hat.validations WHERE entity_id=$1",
      [id]
    )
  ).rows;
}
