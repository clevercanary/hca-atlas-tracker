import { updateSourceStudyValidationsByEntityId } from "app/services/source-studies";
import migrate from "node-pg-migrate";
import { MigrationDirection } from "node-pg-migrate/dist/types";
import pg from "pg";
import {
  FILE_TYPE,
  FILE_VALIDATION_STATUS,
  FileEventInfo,
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBComment,
  HCAAtlasTrackerDBComponentAtlas,
  HCAAtlasTrackerDBComponentAtlasInfo,
  HCAAtlasTrackerDBConcept,
  HCAAtlasTrackerDBEntrySheetValidation,
  HCAAtlasTrackerDBFile,
  HCAAtlasTrackerDBSourceDataset,
  HCAAtlasTrackerDBSourceStudy,
  HCAAtlasTrackerDBUser,
  HCAAtlasTrackerDBValidation,
  HCAAtlasTrackerSourceStudy,
  INTEGRITY_STATUS,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { updateTaskCounts } from "../app/services/atlases";
import {
  doTransaction,
  endPgPool,
  getPoolClient,
  query,
} from "../app/services/database";
import {
  INITIAL_STANDALONE_TEST_FILES,
  INITIAL_TEST_ATLASES,
  INITIAL_TEST_COMMENTS,
  INITIAL_TEST_COMPONENT_ATLASES,
  INITIAL_TEST_ENTRY_SHEET_VALIDATIONS,
  INITIAL_TEST_SOURCE_DATASETS,
  INITIAL_TEST_SOURCE_STUDIES,
  INITIAL_TEST_USERS,
} from "./constants";
import {
  TestComponentAtlas,
  TestEntrySheetValidation,
  TestFile,
  TestSourceDataset,
} from "./entities";
import {
  expectApiValidationsToMatchDb,
  expectDbSourceDatasetToMatchTest,
  expectIsDefined,
  fillTestFileDefaults,
  fillTestSourceDatasetDefaults,
  getTestFileKey,
  makeTestAtlasOverview,
  makeTestSourceDatasetInfo,
  makeTestSourceStudyOverview,
} from "./utils";
import {
  getFileBaseName,
  parseNormalizedInfoFromS3Key,
} from "app/services/s3-notification";

export async function resetDatabase(initEntities = true): Promise<void> {
  const consoleInfoSpy = jest.spyOn(console, "info").mockImplementation();
  // Ensure any existing global pool is fully closed before starting fresh.
  await endPgPool();
  const client = await getPoolClient();
  try {
    await runMigrations("down", client);
    await runMigrations("up", client);
    if (initEntities) await initDatabaseEntries(client);
  } finally {
    client.release();
    consoleInfoSpy.mockRestore();
  }
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
      ],
    );
  }

  const dbUsersByEmail = await getDbUsersByEmail(client);

  await initSourceStudies(client);

  await initFiles(client);

  await initSourceDatasets(client);

  await initAtlases(client);

  await initComponentAtlases(client);

  await initEntrySheetValidations(client);

  await initComments(client, dbUsersByEmail);

  const dbSourceStudies = (
    await client.query<HCAAtlasTrackerDBSourceStudy>(
      "SELECT * FROM hat.source_studies",
    )
  ).rows;
  for (const study of dbSourceStudies) {
    await updateSourceStudyValidationsByEntityId(study.id, client);
  }

  await updateTaskCounts(client);
}

async function initSourceStudies(client: pg.PoolClient): Promise<void> {
  for (const study of INITIAL_TEST_SOURCE_STUDIES) {
    const sdInfo = makeTestSourceStudyOverview(study);
    await client.query(
      "INSERT INTO hat.source_studies (doi, id, study_info) VALUES ($1, $2, $3)",
      ["doi" in study ? study.doi : null, study.id, JSON.stringify(sdInfo)],
    );
  }
}

export async function initSourceDatasets(
  client: pg.PoolClient,
  testSourceDatasets = INITIAL_TEST_SOURCE_DATASETS,
): Promise<void> {
  for (const sourceDataset of testSourceDatasets) {
    const normDataset = fillTestSourceDatasetDefaults(sourceDataset);
    const info = makeTestSourceDatasetInfo(normDataset);
    await client.query(
      "INSERT INTO hat.source_datasets (source_study_id, sd_info, id, reprocessed_status, file_id, version_id, is_latest, wip_number) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [
        normDataset.sourceStudyId,
        info,
        normDataset.id,
        normDataset.reprocessedStatus,
        sourceDataset.file.id,
        normDataset.versionId,
        normDataset.isLatest,
        normDataset.wipNumber,
      ],
    );
  }
}

async function initAtlases(client: pg.PoolClient): Promise<void> {
  for (const atlas of INITIAL_TEST_ATLASES) {
    const overview = makeTestAtlasOverview(atlas);
    await client.query(
      `
        INSERT INTO hat.atlases (id, overview, component_atlases, source_datasets, source_studies, status, target_completion, generation, revision)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `,
      [
        atlas.id,
        JSON.stringify(overview),
        atlas.componentAtlases,
        atlas.sourceDatasets || [],
        JSON.stringify(atlas.sourceStudies || []),
        atlas.status,
        atlas.targetCompletion ?? null,
        atlas.generation,
        atlas.revision,
      ],
    );
  }
}

async function initComponentAtlases(client: pg.PoolClient): Promise<void> {
  for (const componentAtlas of INITIAL_TEST_COMPONENT_ATLASES) {
    const info: HCAAtlasTrackerDBComponentAtlasInfo = {
      capUrl: componentAtlas.capUrl ?? null,
    };
    await client.query(
      `
        INSERT INTO hat.component_atlases (component_info, id, version_id, source_datasets, file_id, wip_number, is_latest)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        info,
        componentAtlas.id,
        componentAtlas.versionId,
        componentAtlas.sourceDatasets?.map((d) => d.versionId) ?? [],
        componentAtlas.file.id,
        componentAtlas.wipNumber ?? 1,
        componentAtlas.isLatest ?? true,
      ],
    );
  }
}

async function initFiles(client: pg.PoolClient): Promise<void> {
  const createdFiles = new Set<TestFile>();
  const createdConcepts = new Set<string>();
  for (const componentAtlas of INITIAL_TEST_COMPONENT_ATLASES) {
    await initTestFile(
      client,
      componentAtlas.file,
      createdFiles,
      createdConcepts,
      componentAtlas.id,
    );
  }
  for (const sourceDataset of INITIAL_TEST_SOURCE_DATASETS) {
    await initTestFile(
      client,
      sourceDataset.file,
      createdFiles,
      createdConcepts,
      sourceDataset.id,
    );
  }
  for (const file of INITIAL_STANDALONE_TEST_FILES) {
    await initTestFile(client, file, createdFiles, createdConcepts);
  }
}

async function initTestFile(
  client: pg.PoolClient,
  file: TestFile,
  createdFiles: Set<TestFile>,
  createdConcepts: Set<string>,
  conceptId: string | null = null,
): Promise<void> {
  // Avoid creating the file if it's already been created, which may happen if it's referenced in multiple test entity definitions
  if (createdFiles.has(file)) return;
  createdFiles.add(file);

  const {
    bucket,
    datasetInfo,
    etag,
    eventName,
    eventTime,
    fileType,
    id,
    integrityCheckedAt,
    integrityError,
    integrityStatus,
    isArchived,
    isLatest,
    resolvedAtlas: atlas,
    sha256Client,
    sha256Server,
    sizeBytes,
    validationInfo,
    validationReports,
    validationStatus,
    validationSummary,
    versionId,
  } = fillTestFileDefaults(file);

  const key = getTestFileKey(file, atlas);

  // Create concept if needed
  if (conceptId && !createdConcepts.has(conceptId)) {
    if (fileType === FILE_TYPE.INGEST_MANIFEST)
      throw new Error("Can't create concept for ingest manifest");
    await createTestConcept(
      {
        atlas_short_name: atlas.shortName.toLowerCase(),
        base_filename: getFileBaseName(file.fileName),
        file_type: fileType,
        generation: atlas.generation,
        id: conceptId,
        network: atlas.network,
      },
      undefined,
      client,
    );
    createdConcepts.add(conceptId);
  }

  const eventInfo: FileEventInfo = {
    eventName,
    eventTime,
  };

  await client.query(
    `
      INSERT INTO hat.files (id, bucket, key, version_id, etag, size_bytes, event_info, sha256_client, sha256_server, integrity_checked_at, integrity_error, integrity_status, validation_status, is_latest, file_type, sns_message_id, dataset_info, validation_info, validation_summary, validation_reports, is_archived, concept_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
    `,
    [
      id,
      bucket,
      key,
      versionId,
      etag,
      sizeBytes,
      JSON.stringify(eventInfo),
      sha256Client,
      sha256Server,
      integrityCheckedAt,
      integrityError,
      integrityStatus,
      validationStatus,
      isLatest,
      fileType,
      `test-sns-message-${id}`, // Generate unique SNS message ID for test data
      JSON.stringify(datasetInfo),
      JSON.stringify(validationInfo),
      JSON.stringify(validationSummary),
      JSON.stringify(validationReports),
      isArchived,
      conceptId,
    ],
  );
}

async function initEntrySheetValidations(client: pg.PoolClient): Promise<void> {
  for (const validation of INITIAL_TEST_ENTRY_SHEET_VALIDATIONS) {
    await initEntrySheetValidation(validation, client);
  }
}

export async function initEntrySheetValidation(
  validation: TestEntrySheetValidation,
  client?: pg.PoolClient,
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
    client,
  );
}

async function initComments(
  client: pg.PoolClient,
  dbUsersByEmail: Record<string, HCAAtlasTrackerDBUser>,
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
      ],
    );
  }
}

export async function createTestConceptFromS3Key(
  s3Key: string,
  conceptId: string,
  allowExistingForId?: boolean,
  client?: pg.PoolClient,
): Promise<void> {
  const info = parseNormalizedInfoFromS3Key(s3Key);
  if (info.fileType === FILE_TYPE.INGEST_MANIFEST)
    throw new Error("Can't create concept for ingest manifest");
  await createTestConcept(
    {
      atlas_short_name: info.atlasShortName,
      base_filename: info.fileBaseName,
      file_type: info.fileType,
      generation: info.atlasVersion.generation,
      id: conceptId,
      network: info.atlasNetwork,
    },
    allowExistingForId,
    client,
  );
}

export async function createTestConcept(
  info: Pick<
    HCAAtlasTrackerDBConcept,
    | "atlas_short_name"
    | "base_filename"
    | "file_type"
    | "generation"
    | "id"
    | "network"
  >,
  allowExistingForId = false,
  client?: pg.PoolClient,
): Promise<void> {
  await query(
    allowExistingForId
      ? "INSERT INTO hat.concepts (atlas_short_name, base_filename, file_type, generation, network, id) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING"
      : "INSERT INTO hat.concepts (atlas_short_name, base_filename, file_type, generation, network, id) VALUES ($1, $2, $3, $4, $5, $6)",
    [
      info.atlas_short_name,
      info.base_filename,
      info.file_type,
      info.generation,
      info.network,
      info.id,
    ],
    client,
  );
}

export async function createTestFile(
  fileId: string,
  config: {
    bucket: string;
    conceptId: string | null;
    etag: string;
    eventTime?: string;
    fileType: FILE_TYPE;
    key: string;
    sizeBytes: number;
    versionId?: string;
  },
  client?: pg.PoolClient,
): Promise<void> {
  // Create concept if needed
  if (config.conceptId !== null)
    await createTestConceptFromS3Key(
      config.key,
      config.conceptId,
      true,
      client,
    );

  // Use the same defaults as fillTestFileDefaults for consistency
  const eventInfo = {
    eventName: "ObjectCreated:*",
    eventTime: config.eventTime ?? new Date().toISOString(),
  };
  await query(
    `INSERT INTO hat.files (id, bucket, key, version_id, etag, size_bytes, event_info, 
     sha256_client, integrity_status, validation_status, is_latest, file_type, sns_message_id, created_at, updated_at, concept_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW(), $14)`,
    [
      fileId,
      config.bucket,
      config.key,
      config.versionId ?? null,
      config.etag,
      config.sizeBytes,
      JSON.stringify(eventInfo),
      null, // sha256Client
      INTEGRITY_STATUS.PENDING,
      FILE_VALIDATION_STATUS.PENDING,
      true, // isLatest
      config.fileType,
      `test-sns-message-${fileId}`, // Generate unique SNS message ID for test data
      config.conceptId,
    ],
    client,
  );
}

async function runMigrations(
  direction: MigrationDirection,
  client: pg.PoolClient,
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

export async function createTestComponentAtlas(
  atlasId: string,
  info: HCAAtlasTrackerDBComponentAtlasInfo,
  fileId: string,
  conceptId?: string,
): Promise<HCAAtlasTrackerDBComponentAtlas> {
  if (conceptId === undefined) conceptId = crypto.randomUUID();
  return doTransaction(async (client) => {
    const componentAtlas = (
      await client.query<HCAAtlasTrackerDBComponentAtlas>(
        `
        INSERT INTO hat.component_atlases (component_info, file_id, id)
        VALUES ($1, $2, $3)
        RETURNING *
      `,
        [JSON.stringify(info), fileId, conceptId],
      )
    ).rows[0];
    await client.query(
      "UPDATE hat.atlases SET component_atlases = component_atlases || $1::uuid WHERE id = $2",
      [componentAtlas.version_id, atlasId],
    );
    return componentAtlas;
  });
}

export async function getDbUsersByEmail(
  client?: pg.PoolClient,
): Promise<Record<string, HCAAtlasTrackerDBUser>> {
  return Object.fromEntries(
    (
      await query<HCAAtlasTrackerDBUser>(
        "SELECT * FROM hat.users",
        undefined,
        client,
      )
    ).rows.map((u) => [u.email, u]),
  );
}

export async function getExistingAtlasFromDatabase(
  id: string,
): Promise<HCAAtlasTrackerDBAtlas> {
  const result = await getAtlasFromDatabase(id);
  if (!result) throw new Error(`Atlas ${id} doesn't exist`);
  return result;
}

export async function getAtlasFromDatabase(
  id: string,
): Promise<HCAAtlasTrackerDBAtlas | undefined> {
  return (
    await query<HCAAtlasTrackerDBAtlas>(
      "SELECT * FROM hat.atlases WHERE id=$1",
      [id],
    )
  ).rows[0];
}

export async function getComponentAtlasFromDatabase(
  versionId: string,
): Promise<HCAAtlasTrackerDBComponentAtlas | undefined> {
  return (
    await query<HCAAtlasTrackerDBComponentAtlas>(
      "SELECT * FROM hat.component_atlases WHERE version_id=$1",
      [versionId],
    )
  ).rows[0];
}

export async function setComponentAtlasDatasets(
  componentAtlas: TestComponentAtlas,
  sourceDatasetVersions: string[],
): Promise<void> {
  await query(
    "UPDATE hat.component_atlases SET source_datasets=$1 WHERE version_id=$2",
    [sourceDatasetVersions, componentAtlas.versionId],
  );
}

export async function getComponentAtlasSourceDatasets(
  componentAtlas: TestComponentAtlas,
): Promise<string[]> {
  return (
    await query<HCAAtlasTrackerDBComponentAtlas>(
      "SELECT * FROM hat.component_atlases WHERE version_id=$1",
      [componentAtlas.versionId],
    )
  ).rows[0].source_datasets;
}

export async function getComponentAtlasAtlas(
  componentAtlasVersion: string,
): Promise<HCAAtlasTrackerDBAtlas> {
  const queryResult = await query<HCAAtlasTrackerDBAtlas>(
    "SELECT * FROM hat.atlases WHERE $1 = ANY(component_atlases)",
    [componentAtlasVersion],
  );
  if (queryResult.rows.length === 0)
    throw new Error(
      `Atlas not found for test component atlas version ${componentAtlasVersion}`,
    );
  return queryResult.rows[0];
}

export async function getExistingSourceStudyFromDatabase(
  id: string,
): Promise<HCAAtlasTrackerDBSourceStudy> {
  const result = await getSourceStudyFromDatabase(id);
  if (!result) throw new Error(`Source study ${id} doesn't exist`);
  return result;
}

export async function getSourceStudyFromDatabase(
  id: string,
): Promise<HCAAtlasTrackerDBSourceStudy | undefined> {
  return (
    await query<HCAAtlasTrackerDBSourceStudy>(
      "SELECT * FROM hat.source_studies WHERE id=$1",
      [id],
    )
  ).rows[0];
}

export async function getAtlasSourceDatasetsFromDatabase(
  atlasId: string,
): Promise<HCAAtlasTrackerDBSourceDataset[]> {
  return (
    await query<HCAAtlasTrackerDBSourceDataset>(
      "SELECT d.* FROM hat.source_datasets d JOIN hat.atlases a ON d.version_id=ANY(a.source_datasets) WHERE a.id=$1",
      [atlasId],
    )
  ).rows;
}

export async function getSourceDatasetFromDatabase(
  versionId: string,
): Promise<HCAAtlasTrackerDBSourceDataset | undefined> {
  return (
    await query<HCAAtlasTrackerDBSourceDataset>(
      "SELECT * FROM hat.source_datasets WHERE version_id=$1",
      [versionId],
    )
  ).rows[0];
}

export async function getAllSourceDatasetsFromDatabase(
  sort = false,
): Promise<HCAAtlasTrackerDBSourceDataset[]> {
  const datasets = (
    await query<HCAAtlasTrackerDBSourceDataset>(
      "SELECT * FROM hat.source_datasets",
    )
  ).rows;
  if (sort) datasets.sort((a, b) => a.version_id.localeCompare(b.version_id));
  return datasets;
}

export async function getCellxGeneSourceDatasetFromDatabase(
  cellxgeneId: string,
): Promise<HCAAtlasTrackerDBSourceDataset | null> {
  const result = (
    await query<HCAAtlasTrackerDBSourceDataset>(
      "SELECT * FROM hat.source_datasets WHERE sd_info->>'cellxgeneDatasetId'=$1",
      [cellxgeneId],
    )
  ).rows[0];
  return result ?? null;
}

export async function getSourceStudySourceDatasetsFromDatabase(
  sourceStudyId: string,
): Promise<HCAAtlasTrackerDBSourceDataset[]> {
  return (
    await query<HCAAtlasTrackerDBSourceDataset>(
      "SELECT * FROM hat.source_datasets WHERE source_study_id=$1",
      [sourceStudyId],
    )
  ).rows;
}

export async function getEntrySheetValidationFromDatabase(
  id: string,
): Promise<HCAAtlasTrackerDBEntrySheetValidation | undefined> {
  return (
    await query<HCAAtlasTrackerDBEntrySheetValidation>(
      "SELECT * FROM hat.entry_sheet_validations WHERE id=$1",
      [id],
    )
  ).rows[0];
}

export async function getEntrySheetValidationBySheetId(
  id: string,
): Promise<HCAAtlasTrackerDBEntrySheetValidation | undefined> {
  return (
    await query<HCAAtlasTrackerDBEntrySheetValidation>(
      "SELECT * FROM hat.entry_sheet_validations WHERE entry_sheet_id=$1",
      [id],
    )
  ).rows[0];
}

export async function getSourceStudyEntrySheetValidationsFromDatabase(
  sourceStudyId: string,
): Promise<HCAAtlasTrackerDBEntrySheetValidation[]> {
  return (
    await query<HCAAtlasTrackerDBEntrySheetValidation>(
      "SELECT * FROM hat.entry_sheet_validations WHERE source_study_id=$1",
      [sourceStudyId],
    )
  ).rows;
}

export async function deleteEntrySheetValidationFromDatabase(
  id: string,
): Promise<void> {
  await query<HCAAtlasTrackerDBEntrySheetValidation>(
    "DELETE FROM hat.entry_sheet_validations WHERE id=$1",
    [id],
  );
}

export async function deleteEntrySheetValidationBySheetId(
  id: string,
): Promise<void> {
  await query<HCAAtlasTrackerDBEntrySheetValidation>(
    "DELETE FROM hat.entry_sheet_validations WHERE entry_sheet_id=$1",
    [id],
  );
}

export async function getStudySourceDatasets(
  studyId: string,
): Promise<HCAAtlasTrackerDBSourceDataset[]> {
  return (
    await query<HCAAtlasTrackerDBSourceDataset>(
      "SELECT * FROM hat.source_datasets WHERE source_study_id=$1",
      [studyId],
    )
  ).rows;
}

export async function getAllFileIdsFromDatabase(): Promise<string[]> {
  return (
    await query<Pick<HCAAtlasTrackerDBFile, "id">>("SELECT id FROM hat.files")
  ).rows.map(({ id }) => id);
}

export async function getFileFromDatabase(
  id: string,
): Promise<HCAAtlasTrackerDBFile | undefined> {
  return (
    await query<HCAAtlasTrackerDBFile>("SELECT * FROM hat.files WHERE id=$1", [
      id,
    ])
  ).rows[0];
}

export async function getConceptFromDatabaseByExpectedId(
  id: string | null,
): Promise<HCAAtlasTrackerDBConcept | undefined> {
  expect(id).not.toBeNull();
  if (id === null) return;
  return getConceptFromDatabase(id);
}

export async function getConceptFromDatabase(
  id: string,
): Promise<HCAAtlasTrackerDBConcept | undefined> {
  return (
    await query<HCAAtlasTrackerDBConcept>(
      "SELECT * FROM hat.concepts WHERE id=$1",
      [id],
    )
  ).rows[0];
}

export async function getConceptFromDatabaseByFileName(
  name: string,
): Promise<HCAAtlasTrackerDBConcept | undefined> {
  const concepts = (
    await query<HCAAtlasTrackerDBConcept>(
      "SELECT * FROM hat.concepts WHERE base_filename=$1",
      [name],
    )
  ).rows;
  if (concepts.length > 1)
    throw new Error(`Multiple concepts exist with filename ${name}`);
  return concepts[0];
}

export async function getValidationsByEntityId(
  id: string,
): Promise<HCAAtlasTrackerDBValidation[]> {
  return (
    await query<HCAAtlasTrackerDBValidation>(
      "SELECT * FROM hat.validations WHERE entity_id=$1",
      [id],
    )
  ).rows;
}

export async function expectComponentAtlasToHaveSourceDatasets(
  componentAtlas: TestComponentAtlas,
  expectedSourceDatasets: TestSourceDataset[],
): Promise<void> {
  const sourceDatasets = await getComponentAtlasSourceDatasets(componentAtlas);
  expect(sourceDatasets).toHaveLength(expectedSourceDatasets.length);
  for (const expectedDataset of expectedSourceDatasets) {
    expect(sourceDatasets).toContain(expectedDataset.versionId);
  }
}

export async function expectSourceDatasetToBeUnchanged(
  sourceDataset: TestSourceDataset,
): Promise<void> {
  const datasetFromDb = await getSourceDatasetFromDatabase(
    sourceDataset.versionId,
  );
  if (!expectIsDefined(datasetFromDb)) return;
  expectDbSourceDatasetToMatchTest(datasetFromDb, sourceDataset);
}

export async function expectSourceDatasetsToHaveSourceStudy(
  sourceDatasetVersions: string[],
  sourceStudyValue: string | null,
): Promise<void> {
  const { rows: sourceDatasets } = await query<
    Pick<HCAAtlasTrackerDBSourceDataset, "source_study_id">
  >(
    "SELECT source_study_id FROM hat.source_datasets WHERE version_id=ANY($1)",
    [sourceDatasetVersions],
  );
  expect(sourceDatasets).toHaveLength(sourceDatasetVersions.length);
  for (const dataset of sourceDatasets) {
    expect(dataset.source_study_id).toEqual(sourceStudyValue);
  }
}

export async function expectApiSourceStudyToHaveMatchingDbValidations(
  sourceStudy: HCAAtlasTrackerSourceStudy,
): Promise<void> {
  const validations = await getValidationsByEntityId(sourceStudy.id);
  expectApiValidationsToMatchDb(sourceStudy.tasks, validations);
}

export async function expectFilesToHaveArchiveStatus(
  fileIds: string[],
  isArchivedValue: boolean,
): Promise<void> {
  const queryResult = await query<
    Pick<HCAAtlasTrackerDBFile, "id" | "is_archived">
  >("SELECT id, is_archived FROM hat.files WHERE id=ANY($1)", [fileIds]);
  expect(queryResult.rows).toEqual(
    new Array(fileIds.length).fill(
      expect.objectContaining({ is_archived: isArchivedValue }),
    ),
  );
}

export async function expectSourceDatasetFileToBeConsistentWith(
  fileId: string,
  params: {
    atlas: string | null;
    componentAtlases?: string[];
    isLatest: boolean;
    otherVersion?: HCAAtlasTrackerDBSourceDataset;
    sourceDataset?: string;
    wipNumber: number;
  },
): Promise<{
  file: HCAAtlasTrackerDBFile;
  sourceDataset: HCAAtlasTrackerDBSourceDataset;
}> {
  const file = await getFileFromDatabase(fileId);
  if (!file) throw new Error(`File ${fileId} doesn't exist`);
  const sourceDataset = await getFileSourceDataset(fileId);

  expect(file.is_latest).toEqual(params.isLatest);
  expect(sourceDataset.is_latest).toEqual(params.isLatest);
  expect(sourceDataset.wip_number).toEqual(params.wipNumber);

  if (params.sourceDataset)
    expect(sourceDataset.version_id).toEqual(params.sourceDataset);

  if (params.atlas) {
    const atlas = await getExistingAtlasFromDatabase(params.atlas);
    expect(atlas.source_datasets).toContain(sourceDataset.version_id);
    if (params.otherVersion)
      expect(atlas.source_datasets).not.toContain(
        params.otherVersion.version_id,
      );
  }

  for (const componentAtlasVersion of params.componentAtlases ?? []) {
    const componentAtlas = await getComponentAtlasFromDatabase(
      componentAtlasVersion,
    );
    if (!componentAtlas)
      throw new Error(
        `Component atlas version ${componentAtlasVersion} doesn't exist`,
      );
    expect(componentAtlas.source_datasets).toContain(sourceDataset.version_id);
    if (params.otherVersion)
      expect(componentAtlas.source_datasets).not.toContain(
        params.otherVersion.version_id,
      );
  }

  if (params.otherVersion) {
    await expectSourceDatasetToBeConsistentWithOtherVersion(
      sourceDataset,
      params.otherVersion,
    );
  }

  return { file, sourceDataset };
}

async function expectSourceDatasetToBeConsistentWithOtherVersion(
  sourceDataset: HCAAtlasTrackerDBSourceDataset,
  otherVersionPrevData: HCAAtlasTrackerDBSourceDataset,
): Promise<void> {
  const otherVersion = await getSourceDatasetFromDatabase(
    otherVersionPrevData.version_id,
  );
  if (!otherVersion)
    throw new Error(
      `Source dataset version ${otherVersionPrevData.version_id} doesn't exist`,
    );
  expect(otherVersion.version_id).not.toEqual(sourceDataset.version_id);
  expect(otherVersion.id).toEqual(sourceDataset.id);
  expect(otherVersion.id).toEqual(otherVersionPrevData.id);
  expect(otherVersion.wip_number).toEqual(otherVersionPrevData.wip_number);
  expect(otherVersion.sd_info).toEqual(otherVersionPrevData.sd_info);
  if (sourceDataset.is_latest) {
    expect(otherVersion.is_latest).toEqual(false);
  } else if (otherVersion.is_latest) {
    expect(sourceDataset.is_latest).toEqual(false);
  }
  expect(otherVersion.wip_number).not.toEqual(sourceDataset.wip_number);
  expect(otherVersion.sd_info).toEqual(sourceDataset.sd_info);
}

export async function expectFileNotToBeReferencedByAnyMetadataEntity(
  fileId: string,
): Promise<void> {
  const {
    rows: [{ referenced }],
  } = await query<{ referenced: boolean }>(
    "SELECT EXISTS(SELECT 1 FROM hat.component_atlases WHERE file_id = $1) OR EXISTS(SELECT 1 FROM hat.source_datasets WHERE file_id = $1) AS referenced",
    [fileId],
  );
  expect(referenced).toEqual(false);
}

export async function getFileComponentAtlas(
  fileId: string,
): Promise<HCAAtlasTrackerDBComponentAtlas> {
  const queryResult = await query<HCAAtlasTrackerDBComponentAtlas>(
    "SELECT * FROM hat.component_atlases WHERE file_id = $1",
    [fileId],
  );
  if (!queryResult.rows.length)
    throw new Error(`No component atlas found for file ${fileId}`);
  return queryResult.rows[0];
}

export async function getFileSourceDataset(
  fileId: string,
): Promise<HCAAtlasTrackerDBSourceDataset> {
  const queryResult = await query<HCAAtlasTrackerDBSourceDataset>(
    "SELECT * FROM hat.source_datasets WHERE file_id = $1",
    [fileId],
  );
  if (!queryResult.rows.length)
    throw new Error(`No source dataset found for file ${fileId}`);
  return queryResult.rows[0];
}

// Simple count helpers for tests
export async function countSourceDatasets(
  client?: pg.PoolClient,
): Promise<number> {
  const result = await query<{ count: number }>(
    "SELECT COUNT(*)::int AS count FROM hat.source_datasets",
    undefined,
    client,
  );
  return result.rows[0].count;
}

export async function countComponentAtlases(
  client?: pg.PoolClient,
): Promise<number> {
  const result = await query<{ count: number }>(
    "SELECT COUNT(*)::int AS count FROM hat.component_atlases",
    undefined,
    client,
  );
  return result.rows[0].count;
}
