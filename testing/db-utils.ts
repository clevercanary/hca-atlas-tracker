import { updateSourceStudyValidationsByEntityId } from "app/services/source-studies";
import migrate from "node-pg-migrate";
import { MigrationDirection } from "node-pg-migrate/dist/types";
import pg from "pg";
import {
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBComment,
  HCAAtlasTrackerDBComponentAtlas,
  HCAAtlasTrackerDBComponentAtlasInfo,
  HCAAtlasTrackerDBEntrySheetValidation,
  HCAAtlasTrackerDBSourceDataset,
  HCAAtlasTrackerDBSourceStudy,
  HCAAtlasTrackerDBUser,
  HCAAtlasTrackerDBValidation,
  HCAAtlasTrackerSourceStudy,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { updateTaskCounts } from "../app/services/atlases";
import { query } from "../app/services/database";
import { getPoolConfig } from "../app/utils/__mocks__/pg-app-connect-config";
import {
  INITIAL_TEST_ATLASES,
  INITIAL_TEST_COMMENTS,
  INITIAL_TEST_COMPONENT_ATLASES,
  INITIAL_TEST_ENTRY_SHEET_VALIDATIONS,
  INITIAL_TEST_SOURCE_DATASETS,
  INITIAL_TEST_SOURCE_STUDIES,
  INITIAL_TEST_USERS,
} from "./constants";
import {
  TestAtlas,
  TestEntrySheetValidation,
  TestSourceDataset,
} from "./entities";
import {
  aggregateSourceDatasetArrayField,
  expectApiValidationsToMatchDb,
  expectDbSourceDatasetToMatchTest,
  expectIsDefined,
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

  await initEntrySheetValidations(client);

  await initComments(client, dbUsersByEmail);

  const dbSourceStudies = (
    await client.query<HCAAtlasTrackerDBSourceStudy>(
      "SELECT * FROM hat.source_studies"
    )
  ).rows;
  for (const study of dbSourceStudies) {
    await updateSourceStudyValidationsByEntityId(study.id, client);
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
      "INSERT INTO hat.atlases (id, overview, source_datasets, source_studies, status, target_completion) VALUES ($1, $2, $3, $4, $5, $6)",
      [
        atlas.id,
        JSON.stringify(overview),
        atlas.sourceDatasets || [],
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

async function initEntrySheetValidations(client: pg.PoolClient): Promise<void> {
  for (const validation of INITIAL_TEST_ENTRY_SHEET_VALIDATIONS) {
    await initEntrySheetValidation(validation, client);
  }
}

export async function initEntrySheetValidation(
  validation: TestEntrySheetValidation,
  client?: pg.PoolClient
): Promise<void> {
  await query(
    "INSERT INTO hat.entry_sheet_validations (entry_sheet_id, entry_sheet_title, id, last_synced, last_updated, source_study_id, validation_report, validation_summary) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
    [
      validation.entry_sheet_id,
      validation.entry_sheet_title,
      validation.id,
      validation.last_synced,
      validation.last_updated,
      validation.source_study_id,
      JSON.stringify(validation.validation_report),
      validation.validation_summary,
    ],
    client
  );
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

export async function getExistingAtlasFromDatabase(
  id: string
): Promise<HCAAtlasTrackerDBAtlas> {
  const result = await getAtlasFromDatabase(id);
  if (!result) throw new Error(`Atlas ${id} doesn't exist`);
  return result;
}

export async function getAtlasFromDatabase(
  id: string
): Promise<HCAAtlasTrackerDBAtlas | undefined> {
  return (
    await query<HCAAtlasTrackerDBAtlas>(
      "SELECT * FROM hat.atlases WHERE id=$1",
      [id]
    )
  ).rows[0];
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

export async function getSourceDatasetFromDatabase(
  id: string
): Promise<HCAAtlasTrackerDBSourceDataset | undefined> {
  return (
    await query<HCAAtlasTrackerDBSourceDataset>(
      "SELECT * FROM hat.source_datasets WHERE id=$1",
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

export async function getSourceStudySourceDatasetsFromDatabase(
  sourceStudyId: string
): Promise<HCAAtlasTrackerDBSourceDataset[]> {
  return (
    await query<HCAAtlasTrackerDBSourceDataset>(
      "SELECT * FROM hat.source_datasets WHERE source_study_id=$1",
      [sourceStudyId]
    )
  ).rows;
}

export async function getEntrySheetValidationFromDatabase(
  id: string
): Promise<HCAAtlasTrackerDBEntrySheetValidation | undefined> {
  return (
    await query<HCAAtlasTrackerDBEntrySheetValidation>(
      "SELECT * FROM hat.entry_sheet_validations WHERE id=$1",
      [id]
    )
  ).rows[0];
}

export async function getEntrySheetValidationBySheetId(
  id: string
): Promise<HCAAtlasTrackerDBEntrySheetValidation | undefined> {
  return (
    await query<HCAAtlasTrackerDBEntrySheetValidation>(
      "SELECT * FROM hat.entry_sheet_validations WHERE entry_sheet_id=$1",
      [id]
    )
  ).rows[0];
}

export async function getSourceStudyEntrySheetValidationsFromDatabase(
  sourceStudyId: string
): Promise<HCAAtlasTrackerDBEntrySheetValidation[]> {
  return (
    await query<HCAAtlasTrackerDBEntrySheetValidation>(
      "SELECT * FROM hat.entry_sheet_validations WHERE source_study_id=$1",
      [sourceStudyId]
    )
  ).rows;
}

export async function deleteEntrySheetValidationFromDatabase(
  id: string
): Promise<void> {
  await query<HCAAtlasTrackerDBEntrySheetValidation>(
    "DELETE FROM hat.entry_sheet_validations WHERE id=$1",
    [id]
  );
}

export async function deleteEntrySheetValidationBySheetId(
  id: string
): Promise<void> {
  await query<HCAAtlasTrackerDBEntrySheetValidation>(
    "DELETE FROM hat.entry_sheet_validations WHERE entry_sheet_id=$1",
    [id]
  );
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

export async function expectAtlasToBeUnchanged(
  atlas: TestAtlas
): Promise<void> {
  const atlasFromDb = await getAtlasFromDatabase(atlas.id);
  if (!expectIsDefined(atlasFromDb)) return;
  expect(atlasFromDb.overview.cellxgeneAtlasCollection).toEqual(
    atlas.cellxgeneAtlasCollection
  );
  expect(atlasFromDb.overview.codeLinks).toEqual(atlas.codeLinks);
  expect(atlasFromDb.overview.description).toEqual(atlas.description);
  expect(atlasFromDb.overview.highlights).toEqual(atlas.highlights);
  expect(atlasFromDb.overview.integrationLead).toEqual(atlas.integrationLead);
  expect(atlasFromDb.overview.network).toEqual(atlas.network);
  expect(atlasFromDb.overview.publications).toEqual(atlas.publications);
  expect(atlasFromDb.overview.shortName).toEqual(atlas.shortName);
  expect(atlasFromDb.overview.version).toEqual(atlas.version);
  expect(atlasFromDb.overview.wave).toEqual(atlas.wave);
  expect(atlasFromDb.source_datasets).toEqual(atlas.sourceDatasets ?? []);
  expect(atlasFromDb.source_studies).toEqual(atlas.sourceStudies);
  expect(atlasFromDb.status).toEqual(atlas.status);
  expect(atlasFromDb.target_completion).toEqual(atlas.targetCompletion ?? null);
}

export async function expectSourceDatasetToBeUnchanged(
  sourceDataset: TestSourceDataset
): Promise<void> {
  const datasetFromDb = await getSourceDatasetFromDatabase(sourceDataset.id);
  if (!expectIsDefined(datasetFromDb)) return;
  expectDbSourceDatasetToMatchTest(datasetFromDb, sourceDataset);
}

export async function expectApiSourceStudyToHaveMatchingDbValidations(
  sourceStudy: HCAAtlasTrackerSourceStudy
): Promise<void> {
  const validations = await getValidationsByEntityId(sourceStudy.id);
  expectApiValidationsToMatchDb(sourceStudy.tasks, validations);
}
