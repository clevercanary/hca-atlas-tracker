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
  getPrimaryFileForTestEntity,
  getTestEntityFileIds,
  getTestEntityFilesArray,
  getTestFileKey,
  makeTestAtlasOverview,
  makeTestSourceDatasetInfo,
  makeTestSourceStudyOverview,
} from "./utils";

export async function resetDatabase(): Promise<void> {
  const consoleInfoSpy = jest.spyOn(console, "info").mockImplementation();
  // Ensure any existing global pool is fully closed before starting fresh.
  await endPgPool();
  const client = await getPoolClient();
  try {
    await runMigrations("down", client);
    await runMigrations("up", client);
    await initDatabaseEntries(client);
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
      ]
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
      "SELECT * FROM hat.source_studies"
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
      ["doi" in study ? study.doi : null, study.id, JSON.stringify(sdInfo)]
    );
  }
}

export async function initSourceDatasets(
  client: pg.PoolClient,
  testSourceDatasets = INITIAL_TEST_SOURCE_DATASETS
): Promise<void> {
  for (const sourceDataset of testSourceDatasets) {
    const normDataset = fillTestSourceDatasetDefaults(sourceDataset);
    const info = makeTestSourceDatasetInfo(normDataset);
    const latestFile = getPrimaryFileForTestEntity(sourceDataset);
    await client.query(
      "INSERT INTO hat.source_datasets (source_study_id, sd_info, id, reprocessed_status, file_id) VALUES ($1, $2, $3, $4, $5)",
      [
        normDataset.sourceStudyId,
        info,
        normDataset.id,
        normDataset.reprocessedStatus,
        latestFile.id,
      ]
    );
    const fileIds = getTestEntityFileIds(sourceDataset);
    await client.query(
      "UPDATE hat.files SET source_dataset_id = $1 WHERE id = ANY($2)",
      [sourceDataset.id, fileIds]
    );
  }
}

async function initAtlases(client: pg.PoolClient): Promise<void> {
  for (const atlas of INITIAL_TEST_ATLASES) {
    const overview = makeTestAtlasOverview(atlas);
    await client.query(
      "INSERT INTO hat.atlases (id, overview, component_atlases, source_datasets, source_studies, status, target_completion) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [
        atlas.id,
        JSON.stringify(overview),
        atlas.componentAtlases,
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
        componentAtlas.sourceDatasets?.map((d) => d.id) ?? [],
        componentAtlas.file.id,
        componentAtlas.wipNumber ?? 1,
        componentAtlas.isLatest ?? true,
      ]
    );
  }
}

async function initFiles(client: pg.PoolClient): Promise<void> {
  const createdFiles = new Set<TestFile>();
  for (const componentAtlas of INITIAL_TEST_COMPONENT_ATLASES) {
    await initTestFile(client, componentAtlas.file, createdFiles);
  }
  for (const sourceDataset of INITIAL_TEST_SOURCE_DATASETS) {
    for (const file of getTestEntityFilesArray(sourceDataset)) {
      await initTestFile(client, file, createdFiles);
    }
  }
  for (const file of INITIAL_STANDALONE_TEST_FILES) {
    await initTestFile(client, file, createdFiles);
  }
}

async function initTestFile(
  client: pg.PoolClient,
  file: TestFile,
  createdFiles: Set<TestFile>
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
  const eventInfo: FileEventInfo = {
    eventName,
    eventTime,
  };
  await client.query(
    `
      INSERT INTO hat.files (id, bucket, key, version_id, etag, size_bytes, event_info, sha256_client, sha256_server, integrity_checked_at, integrity_error, integrity_status, validation_status, is_latest, file_type, sns_message_id, dataset_info, validation_info, validation_summary, validation_reports, is_archived)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
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
    ]
  );
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

export async function createTestFile(
  fileId: string,
  config: {
    bucket: string;
    etag: string;
    eventTime?: string;
    fileType: FILE_TYPE;
    key: string;
    sizeBytes: number;
    versionId?: string;
  },
  client?: pg.PoolClient
): Promise<void> {
  // Use the same defaults as fillTestFileDefaults for consistency
  const eventInfo = {
    eventName: "ObjectCreated:*",
    eventTime: config.eventTime ?? new Date().toISOString(),
  };
  await query(
    `INSERT INTO hat.files (id, bucket, key, version_id, etag, size_bytes, event_info, 
     sha256_client, integrity_status, validation_status, is_latest, file_type, sns_message_id, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())`,
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
    ],
    client
  );
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

export async function createTestComponentAtlas(
  atlasId: string,
  info: HCAAtlasTrackerDBComponentAtlasInfo,
  fileId: string
): Promise<HCAAtlasTrackerDBComponentAtlas> {
  return doTransaction(async (client) => {
    const componentAtlas = (
      await client.query<HCAAtlasTrackerDBComponentAtlas>(
        `
        INSERT INTO hat.component_atlases (component_info, file_id)
        VALUES ($1, $2)
        RETURNING *
      `,
        [JSON.stringify(info), fileId]
      )
    ).rows[0];
    await client.query(
      "UPDATE hat.atlases SET component_atlases = component_atlases || $1::uuid WHERE id = $2",
      [componentAtlas.version_id, atlasId]
    );
    return componentAtlas;
  });
}

export async function getDbUsersByEmail(
  client?: pg.PoolClient
): Promise<Record<string, HCAAtlasTrackerDBUser>> {
  return Object.fromEntries(
    (
      await query<HCAAtlasTrackerDBUser>(
        "SELECT * FROM hat.users",
        undefined,
        client
      )
    ).rows.map((u) => [u.email, u])
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

export async function getComponentAtlasFromDatabase(
  versionId: string
): Promise<HCAAtlasTrackerDBComponentAtlas | undefined> {
  return (
    await query<HCAAtlasTrackerDBComponentAtlas>(
      "SELECT * FROM hat.component_atlases WHERE version_id=$1",
      [versionId]
    )
  ).rows[0];
}

export async function setComponentAtlasDatasets(
  componentAtlas: TestComponentAtlas,
  sourceDatasetIds: string[]
): Promise<void> {
  await query(
    "UPDATE hat.component_atlases SET source_datasets=$1 WHERE version_id=$2",
    [sourceDatasetIds, componentAtlas.versionId]
  );
}

export async function getComponentAtlasSourceDatasets(
  componentAtlas: TestComponentAtlas
): Promise<string[]> {
  return (
    await query<HCAAtlasTrackerDBComponentAtlas>(
      "SELECT * FROM hat.component_atlases WHERE version_id=$1",
      [componentAtlas.versionId]
    )
  ).rows[0].source_datasets;
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

export async function getAtlasSourceDatasetsFromDatabase(
  atlasId: string
): Promise<HCAAtlasTrackerDBSourceDataset[]> {
  return (
    await query<HCAAtlasTrackerDBSourceDataset>(
      "SELECT d.* FROM hat.source_datasets d JOIN hat.atlases a ON d.id=ANY(a.source_datasets) WHERE a.id=$1",
      [atlasId]
    )
  ).rows;
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

export async function getAllSourceDatasetsFromDatabase(
  sort = false
): Promise<HCAAtlasTrackerDBSourceDataset[]> {
  const datasets = (
    await query<HCAAtlasTrackerDBSourceDataset>(
      "SELECT * FROM hat.source_datasets"
    )
  ).rows;
  if (sort) datasets.sort((a, b) => a.id.localeCompare(b.id));
  return datasets;
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

export async function getAllFileIdsFromDatabase(): Promise<string[]> {
  return (
    await query<Pick<HCAAtlasTrackerDBFile, "id">>("SELECT id FROM hat.files")
  ).rows.map(({ id }) => id);
}

export async function getFileFromDatabase(
  id: string
): Promise<HCAAtlasTrackerDBFile | undefined> {
  return (
    await query<HCAAtlasTrackerDBFile>("SELECT * FROM hat.files WHERE id=$1", [
      id,
    ])
  ).rows[0];
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

export async function expectComponentAtlasToHaveSourceDatasets(
  componentAtlas: TestComponentAtlas,
  expectedSourceDatasets: TestSourceDataset[]
): Promise<void> {
  const sourceDatasets = await getComponentAtlasSourceDatasets(componentAtlas);
  expect(sourceDatasets).toHaveLength(expectedSourceDatasets.length);
  for (const expectedDataset of expectedSourceDatasets) {
    expect(sourceDatasets).toContain(expectedDataset.id);
  }
}

export async function expectSourceDatasetToBeUnchanged(
  sourceDataset: TestSourceDataset
): Promise<void> {
  const datasetFromDb = await getSourceDatasetFromDatabase(sourceDataset.id);
  if (!expectIsDefined(datasetFromDb)) return;
  expectDbSourceDatasetToMatchTest(datasetFromDb, sourceDataset);
}

export async function expectSourceDatasetsToHaveSourceStudy(
  sourceDatasetIds: string[],
  sourceStudyValue: string | null
): Promise<void> {
  const { rows: sourceDatasets } = await query<
    Pick<HCAAtlasTrackerDBSourceDataset, "source_study_id">
  >("SELECT source_study_id FROM hat.source_datasets WHERE id=ANY($1)", [
    sourceDatasetIds,
  ]);
  expect(sourceDatasets).toHaveLength(sourceDatasetIds.length);
  for (const dataset of sourceDatasets) {
    expect(dataset.source_study_id).toEqual(sourceStudyValue);
  }
}

export async function expectApiSourceStudyToHaveMatchingDbValidations(
  sourceStudy: HCAAtlasTrackerSourceStudy
): Promise<void> {
  const validations = await getValidationsByEntityId(sourceStudy.id);
  expectApiValidationsToMatchDb(sourceStudy.tasks, validations);
}

export async function expectFilesToHaveArchiveStatus(
  fileIds: string[],
  isArchivedValue: boolean
): Promise<void> {
  const queryResult = await query<
    Pick<HCAAtlasTrackerDBFile, "id" | "is_archived">
  >("SELECT id, is_archived FROM hat.files WHERE id=ANY($1)", [fileIds]);
  expect(queryResult.rows).toEqual(
    new Array(fileIds.length).fill(
      expect.objectContaining({ is_archived: isArchivedValue })
    )
  );
}

export async function expectOldFileNotToBeReferencedByMetadataEntity(
  fileId: string,
  metadataEntityId?: string
): Promise<void> {
  const file = await getFileFromDatabase(fileId);
  if (file === undefined) throw new Error(`File ${fileId} not found`);

  if (file.file_type === FILE_TYPE.INTEGRATED_OBJECT)
    throw new Error(
      "Checking for lack of reference to old file is not applicable to component atlases"
    );

  expect(file.file_type).not.toEqual(FILE_TYPE.INGEST_MANIFEST);
  if (file.file_type === FILE_TYPE.INGEST_MANIFEST) return;

  expect(file.is_latest).toEqual(false);

  if (metadataEntityId === undefined) {
    expect(file.source_dataset_id).toBeTruthy();
    await expectFileNotToBeReferencedByAnyMetadataEntity(file.id);
  } else {
    const metadataEntity = await getMetadataEntityOfType(
      metadataEntityId,
      file.file_type
    );
    if (expectIsDefined(metadataEntity)) {
      expectFileToReferenceMetadataEntity(file, metadataEntity.id);
      expect(metadataEntity.file_id).not.toEqual(fileId);
    }
  }
}

export async function expectReferenceBetweenFileAndMetadataEntity(
  fileId: string,
  knownMetadataEntityId?: string // Should be version ID for component atlases
): Promise<void> {
  const file = await getFileFromDatabase(fileId);
  if (file === undefined) throw new Error(`File ${fileId} not found`);

  expect(file.is_latest).toEqual(true);

  const metadataEntity = await expectGetFileMetadataEntity(
    file,
    knownMetadataEntityId
  );

  expectFileToReferenceMetadataEntity(file, metadataEntity.id);
  expect(metadataEntity.file_id).toEqual(file.id);
}

function expectFileToReferenceMetadataEntity(
  file: HCAAtlasTrackerDBFile,
  metadataEntityId: string
): void {
  expect(file.file_type).not.toEqual(FILE_TYPE.INGEST_MANIFEST);
  if (file.file_type === FILE_TYPE.INTEGRATED_OBJECT) {
    throw new Error(
      "A component atlas file cannot reference a metadata entity"
    );
  } else {
    expect(file.source_dataset_id).toEqual(metadataEntityId);
  }
}

export async function expectFileNotToBeReferencedByAnyMetadataEntity(
  fileId: string
): Promise<void> {
  const {
    rows: [{ referenced }],
  } = await query<{ referenced: boolean }>(
    "SELECT EXISTS(SELECT 1 FROM hat.component_atlases WHERE file_id = $1) OR EXISTS(SELECT 1 FROM hat.source_datasets WHERE file_id = $1) AS referenced",
    [fileId]
  );
  expect(referenced).toEqual(false);
}

/**
 * Get the metadata entity for the given file. If a known metadata entity ID (version ID for component atlases) is specified, call `expect` to check that it matches the file.
 * @param file - File ID.
 * @param knownMetadataEntityId - Known metadata entity (version) ID.
 * @returns metadata entity.
 */
async function expectGetFileMetadataEntity(
  file: HCAAtlasTrackerDBFile,
  knownMetadataEntityId?: string
): Promise<HCAAtlasTrackerDBComponentAtlas | HCAAtlasTrackerDBSourceDataset> {
  const metadataEntity = await getFileMetadataEntity(file);
  if (knownMetadataEntityId !== undefined) {
    expect(
      "version_id" in metadataEntity
        ? metadataEntity.version_id
        : metadataEntity.id
    ).toEqual(knownMetadataEntityId);
  }
  return metadataEntity;
}

export async function getFileMetadataEntity(
  file: HCAAtlasTrackerDBFile
): Promise<HCAAtlasTrackerDBComponentAtlas | HCAAtlasTrackerDBSourceDataset> {
  if (file.file_type === FILE_TYPE.INTEGRATED_OBJECT) {
    const metadataEntityResult = await query<HCAAtlasTrackerDBComponentAtlas>(
      "SELECT * FROM hat.component_atlases WHERE file_id = $1",
      [file.id]
    );
    if (metadataEntityResult.rows.length === 0)
      throw new Error(`No component atlas found for file ${file.id}`);
    return metadataEntityResult.rows[0];
  } else if (file.file_type === FILE_TYPE.SOURCE_DATASET) {
    const metadataEntityResult = await query<HCAAtlasTrackerDBSourceDataset>(
      "SELECT * FROM hat.source_datasets WHERE file_id = $1",
      [file.id]
    );
    if (metadataEntityResult.rows.length === 0)
      throw new Error(`No source dataset found for file ${file.id}`);
    return metadataEntityResult.rows[0];
  } else {
    throw new Error(`${file.file_type} file can't have a metadata entity`);
  }
}

async function getMetadataEntityOfType(
  metadataEntityId: string, // Should be version ID for component atlases
  fileType: FILE_TYPE.INTEGRATED_OBJECT | FILE_TYPE.SOURCE_DATASET
): Promise<
  HCAAtlasTrackerDBComponentAtlas | HCAAtlasTrackerDBSourceDataset | undefined
> {
  switch (fileType) {
    case FILE_TYPE.INTEGRATED_OBJECT: {
      return await getComponentAtlasFromDatabase(metadataEntityId);
    }
    case FILE_TYPE.SOURCE_DATASET: {
      return await getSourceDatasetFromDatabase(metadataEntityId);
    }
  }
}

export async function getFileComponentAtlas(
  fileId: string
): Promise<HCAAtlasTrackerDBComponentAtlas> {
  const queryResult = await query<HCAAtlasTrackerDBComponentAtlas>(
    "SELECT * FROM hat.component_atlases WHERE file_id = $1",
    [fileId]
  );
  if (!queryResult.rows.length)
    throw new Error(`No component atlas found for file ${fileId}`);
  return queryResult.rows[0];
}

// Simple count helpers for tests
export async function countSourceDatasets(
  client?: pg.PoolClient
): Promise<number> {
  const result = await query<{ count: number }>(
    "SELECT COUNT(*)::int AS count FROM hat.source_datasets",
    undefined,
    client
  );
  return result.rows[0].count;
}

export async function countComponentAtlases(
  client?: pg.PoolClient
): Promise<number> {
  const result = await query<{ count: number }>(
    "SELECT COUNT(*)::int AS count FROM hat.component_atlases",
    undefined,
    client
  );
  return result.rows[0].count;
}
