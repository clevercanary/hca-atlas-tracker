import migrate from "node-pg-migrate";
import { MigrationDirection } from "node-pg-migrate/dist/types";
import pg from "pg";
import {
  HCAAtlasTrackerDBComment,
  HCAAtlasTrackerDBComponentAtlas,
  HCAAtlasTrackerDBComponentAtlasInfo,
  HCAAtlasTrackerDBSourceDataset,
  HCAAtlasTrackerDBSourceStudy,
  HCAAtlasTrackerDBUser,
  HCAAtlasTrackerDBValidation,
  HCAAtlasTrackerSourceStudy,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { updateTaskCounts } from "../app/services/atlases";
import { query } from "../app/services/database";
import { updateSourceStudyValidations } from "../app/services/validations";
import { getPoolConfig } from "../app/utils/__mocks__/pg-app-connect-config";
import {
  INITIAL_TEST_ATLASES,
  INITIAL_TEST_COMMENTS,
  INITIAL_TEST_COMPONENT_ATLASES,
  INITIAL_TEST_SOURCE_DATASETS,
  INITIAL_TEST_SOURCE_STUDIES,
  INITIAL_TEST_USERS,
} from "./constants";
import {
  aggregateSourceDatasetArrayField,
  expectApiValidationsToMatchDb,
  makeTestAtlasOverview,
  makeTestSourceDatasetInfo,
  makeTestSourceStudyOverview,
} from "./utils";

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
      "INSERT INTO hat.users (disabled, email, full_name, role, role_associated_resource_ids) VALUES ($1, $2, $3, $4, $5)",
      [
        user.disabled.toString(),
        user.email,
        user.name,
        user.role,
        user.roleAssociatedResourceIds,
      ]
    );
  }

  const dbUsersByEmail = await getDbUsersByEmail();

  await initSourceStudies(client);

  await initSourceDatasets(client);

  await initAtlases(client);

  await initComponentAtlases(client);

  await initComments(client, dbUsersByEmail);

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

async function initSourceStudies(client: pg.PoolClient): Promise<void> {
  for (const study of INITIAL_TEST_SOURCE_STUDIES) {
    const sdInfo = makeTestSourceStudyOverview(study);
    await client.query(
      "INSERT INTO hat.source_studies (doi, id, study_info) VALUES ($1, $2, $3)",
      ["doi" in study ? study.doi : null, study.id, JSON.stringify(sdInfo)]
    );
  }
}

export async function initSourceDatasets(
  client?: pg.PoolClient,
  testSourceDatasets = INITIAL_TEST_SOURCE_DATASETS
): Promise<void> {
  for (const sourceDataset of testSourceDatasets) {
    const info = makeTestSourceDatasetInfo(sourceDataset);
    await query(
      "INSERT INTO hat.source_datasets (source_study_id, sd_info, id) VALUES ($1, $2, $3)",
      [sourceDataset.sourceStudyId, info, sourceDataset.id],
      client
    );
  }
}

async function initAtlases(client: pg.PoolClient): Promise<void> {
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
}

async function initComponentAtlases(client: pg.PoolClient): Promise<void> {
  for (const componentAtlas of INITIAL_TEST_COMPONENT_ATLASES) {
    const info: HCAAtlasTrackerDBComponentAtlasInfo = {
      assay: aggregateSourceDatasetArrayField(
        componentAtlas.sourceDatasets,
        "assay"
      ),
      cellCount:
        componentAtlas.sourceDatasets?.reduce(
          (sum, d) => sum + (d.cellCount ?? 0),
          0
        ) ?? 0,
      cellxgeneDatasetId: null,
      cellxgeneDatasetVersion: null,
      description: componentAtlas.description,
      disease: aggregateSourceDatasetArrayField(
        componentAtlas.sourceDatasets,
        "disease"
      ),
      suspensionType: aggregateSourceDatasetArrayField(
        componentAtlas.sourceDatasets,
        "suspensionType"
      ),
      tissue: aggregateSourceDatasetArrayField(
        componentAtlas.sourceDatasets,
        "tissue"
      ),
    };
    await client.query(
      "INSERT INTO hat.component_atlases (atlas_id, component_info, id, source_datasets, title) VALUES ($1, $2, $3, $4, $5)",
      [
        componentAtlas.atlasId,
        info,
        componentAtlas.id,
        componentAtlas.sourceDatasets?.map((d) => d.id) ?? [],
        componentAtlas.title,
      ]
    );
  }
}

async function initComments(
  client: pg.PoolClient,
  dbUsersByEmail: Record<string, HCAAtlasTrackerDBUser>
): Promise<void> {
  for (const comment of INITIAL_TEST_COMMENTS) {
    const createdAt = new Date(comment.createdAt);
    const createdBy = dbUsersByEmail[comment.createdBy.email].id;
    const fields: HCAAtlasTrackerDBComment = {
      created_at: createdAt,
      created_by: createdBy,
      id: comment.id,
      text: comment.text,
      thread_id: comment.threadId,
      updated_at: createdAt,
      updated_by: createdBy,
    };
    await client.query(
      "INSERT INTO hat.comments (created_at, created_by, id, text, thread_id, updated_at, updated_by) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [
        fields.created_at,
        fields.created_by,
        fields.id,
        fields.text,
        fields.thread_id,
        fields.updated_at,
        fields.updated_by,
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

export async function getDbUsersByEmail(): Promise<
  Record<string, HCAAtlasTrackerDBUser>
> {
  return Object.fromEntries(
    (await query<HCAAtlasTrackerDBUser>("SELECT * FROM hat.users")).rows.map(
      (u) => [u.email, u]
    )
  );
}

export async function getExistingComponentAtlasFromDatabase(
  id: string
): Promise<HCAAtlasTrackerDBComponentAtlas> {
  const result = await getComponentAtlasFromDatabase(id);
  if (!result) throw new Error(`Component atlas ${id} doesn't exist`);
  return result;
}

export async function getComponentAtlasFromDatabase(
  id: string
): Promise<HCAAtlasTrackerDBComponentAtlas | undefined> {
  return (
    await query<HCAAtlasTrackerDBComponentAtlas>(
      "SELECT * FROM hat.component_atlases WHERE id=$1",
      [id]
    )
  ).rows[0];
}

export async function getExistingSourceStudyFromDatabase(
  id: string
): Promise<HCAAtlasTrackerDBSourceStudy> {
  const result = await getSourceStudyFromDatabase(id);
  if (!result) throw new Error(`Source study ${id} doesn't exist`);
  return result;
}

export async function getSourceStudyFromDatabase(
  id: string
): Promise<HCAAtlasTrackerDBSourceStudy | undefined> {
  return (
    await query<HCAAtlasTrackerDBSourceStudy>(
      "SELECT * FROM hat.source_studies WHERE id=$1",
      [id]
    )
  ).rows[0];
}

export async function getCellxGeneSourceDatasetFromDatabase(
  cellxgeneId: string
): Promise<HCAAtlasTrackerDBSourceDataset | null> {
  const result = (
    await query<HCAAtlasTrackerDBSourceDataset>(
      "SELECT * FROM hat.source_datasets WHERE sd_info->>'cellxgeneDatasetId'=$1",
      [cellxgeneId]
    )
  ).rows[0];
  return result ?? null;
}

export async function getStudySourceDatasets(
  studyId: string
): Promise<HCAAtlasTrackerDBSourceDataset[]> {
  return (
    await query<HCAAtlasTrackerDBSourceDataset>(
      "SELECT * FROM hat.source_datasets WHERE source_study_id=$1",
      [studyId]
    )
  ).rows;
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

export async function expectApiSourceStudyToHaveMatchingDbValidations(
  sourceStudy: HCAAtlasTrackerSourceStudy
): Promise<void> {
  const validations = await getValidationsByEntityId(sourceStudy.id);
  expectApiValidationsToMatchDb(sourceStudy.tasks, validations);
}
