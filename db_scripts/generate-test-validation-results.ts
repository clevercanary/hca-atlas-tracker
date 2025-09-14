import pg from "pg";
import {
  HCAAtlasTrackerDBComponentAtlas,
  HCAAtlasTrackerDBFile,
  HCAAtlasTrackerDBFileValidationInfo,
  HCAAtlasTrackerDBSourceDataset,
  INTEGRITY_STATUS,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { doTransaction, endPgPool } from "../app/services/database";

/**
 * Usage: `npx esrun db_scripts/generate-test-validation-results.ts <keyword ...>`
 * Each keyword can be an atlas ID, and atlas short name, an atlas name with version,
 * a component atlas ID, a source dataset ID, a file ID, a file key, or a file name.
 * An atlas represents files of that atlas's component atlases and source datasets,
 * a component atlas or source dataset represents the corresponding file, and a file
 * represent the file itself. All matched files will have random validation results
 * added to them.
 */

const FAILED_VALIDATION_PROBABILITY = 0.5;

// (Below use uninclusive max)

const MIN_CELL_COUNT = 100;
const MAX_CELL_COUNT = 10000;

const MIN_ARRAY_LENGTH = 1;
const MAX_ARRAY_LENGTH = 6;

const LETTERS = "abcdefghijklmnopqrstuvwxyz";

generateAndAddValidationResults();

async function generateAndAddValidationResults(): Promise<void> {
  const entityKeywords = process.argv.slice(2);

  let fileKeysById: Map<string, string> = new Map(); // Initial value is overwritten and is only here because TS can't tell that the callback below will run

  await doTransaction(async (client) => {
    const fileIds = await getFileIdsByEntityKeywords(entityKeywords, client);
    fileKeysById = await getFileKeysById(fileIds, client);
    await addValidationResultsToFiles(fileIds, fileKeysById, client);
  });

  console.log(
    "Added validation results to:\n" +
      Array.from(fileKeysById.values()).join("\n")
  );

  endPgPool();
}

async function addValidationResultsToFiles(
  fileIds: string[],
  fileKeysById: Map<string, string>,
  client: pg.PoolClient
): Promise<void> {
  for (const fileId of fileIds) {
    const validationDate = new Date().toISOString();
    let successRelatedFields: Pick<
      HCAAtlasTrackerDBFile,
      "dataset_info" | "integrity_error" | "integrity_status"
    >;
    if (Math.random() < FAILED_VALIDATION_PROBABILITY) {
      successRelatedFields = {
        dataset_info: null,
        integrity_error: `Test error ${fileId}`,
        integrity_status: INTEGRITY_STATUS.INVALID,
      };
    } else {
      const key = fileKeysById.get(fileId);
      successRelatedFields = {
        dataset_info: {
          assay: generateArray("assay"),
          cellCount:
            Math.floor(Math.random() * (MAX_CELL_COUNT - MIN_CELL_COUNT)) +
            MIN_CELL_COUNT,
          disease: generateArray("disease"),
          suspensionType: generateArray("suspension-type"),
          tissue: generateArray("tissue"),
          title: `Test ${(key && key.split("/").pop()) || fileId}`,
        },
        integrity_error: null,
        integrity_status: INTEGRITY_STATUS.VALID,
      };
    }
    const validationInfo: HCAAtlasTrackerDBFileValidationInfo = {
      batchJobId: `test-batch-job-${crypto.randomUUID()}`,
      snsMessageId: `test-sns-message-${crypto.randomUUID()}`,
      snsMessageTime: new Date().toISOString(),
    };
    await client.query(
      `
        UPDATE hat.files
        SET
          dataset_info = $1,
          integrity_error = $2,
          integrity_status = $3,
          validation_info = $4,
          integrity_checked_at = $5
        WHERE id=$6
      `,
      [
        successRelatedFields.dataset_info &&
          JSON.stringify(successRelatedFields.dataset_info),
        successRelatedFields.integrity_error,
        successRelatedFields.integrity_status,
        JSON.stringify(validationInfo),
        validationDate,
        fileId,
      ]
    );
  }
}

function generateArray(itemBase: string): string[] {
  const lettersLeft = Array.from(LETTERS);
  const amount =
    Math.floor(Math.random() * (MAX_ARRAY_LENGTH - MIN_ARRAY_LENGTH)) +
    MIN_ARRAY_LENGTH;
  const result: string[] = [];
  for (let i = 0; i < amount; i++) {
    const j = Math.floor(Math.random() * lettersLeft.length);
    result.push(`${itemBase}-${lettersLeft[j]}`);
    lettersLeft.splice(j, 1);
  }
  return result;
}

async function getFileKeysById(
  fileIds: string[],
  client: pg.PoolClient
): Promise<Map<string, string>> {
  const result = await client.query<Pick<HCAAtlasTrackerDBFile, "id" | "key">>(
    "SELECT id, key FROM hat.files WHERE id=ANY($1)",
    [fileIds]
  );
  return new Map(result.rows.map((r) => [r.id, r.key]));
}

async function getFileIdsByEntityKeywords(
  keywords: string[],
  client: pg.PoolClient
): Promise<string[]> {
  const atlasIds: string[] = [];
  const sourceDatasetIds: string[] = [];
  const componentAtlasIds: string[] = [];
  const fileIds: string[] = [];

  for (const keyword of keywords) {
    let foundEntity = false;
    foundEntity = await findEntityOfTypeForKeyword(
      "atlases",
      keyword,
      atlasIds,
      foundEntity,
      client,
      `
        SELECT id FROM hat.atlases
        WHERE
          id::text = $1
          OR LOWER(overview->>'shortName') = LOWER($1)
          OR LOWER((overview->>'shortName') || ' v' || (overview->>'version')) = LOWER($1)
      `
    );
    foundEntity = await findEntityOfTypeForKeyword(
      "source datasets",
      keyword,
      sourceDatasetIds,
      foundEntity,
      client,
      "SELECT id FROM hat.source_datasets WHERE id::text = $1"
    );
    foundEntity = await findEntityOfTypeForKeyword(
      "integrated objects",
      keyword,
      componentAtlasIds,
      foundEntity,
      client,
      "SELECT id FROM hat.component_atlases WHERE id::text = $1"
    );
    foundEntity = await findEntityOfTypeForKeyword(
      "files",
      keyword,
      fileIds,
      foundEntity,
      client,
      `
        SELECT id FROM hat.files
        WHERE (
          id::text = $1
          OR LOWER(key) = LOWER($1)
          OR LOWER(split_part(key, '/', 4)) = LOWER($1)
        ) AND (file_type = 'integrated_object' OR file_type = 'source_dataset')
      `
    );
    if (!foundEntity)
      throw new Error(`No entity found for keyword ${JSON.stringify(keyword)}`);
  }

  if (atlasIds.length) {
    const sourceDatasetsResult = await client.query<
      Pick<HCAAtlasTrackerDBSourceDataset, "id">
    >(
      "SELECT d.id FROM hat.atlases a JOIN hat.source_datasets d ON d.id=ANY(a.source_datasets) WHERE a.id=ANY($1)",
      [atlasIds]
    );
    sourceDatasetIds.push(...sourceDatasetsResult.rows.map((r) => r.id));
    const componentAtlasesResult = await client.query<
      Pick<HCAAtlasTrackerDBComponentAtlas, "id">
    >("SELECT c.id FROM hat.component_atlases c WHERE c.atlas_id=ANY($1)", [
      atlasIds,
    ]);
    componentAtlasIds.push(...componentAtlasesResult.rows.map((r) => r.id));
  }

  if (sourceDatasetIds.length || componentAtlasIds.length) {
    const result = await client.query<Pick<HCAAtlasTrackerDBFile, "id">>(
      "SELECT f.id FROM hat.files f WHERE f.source_dataset_id=ANY($1) OR f.component_atlas_id=ANY($2)",
      [sourceDatasetIds, componentAtlasIds]
    );
    fileIds.push(...result.rows.map((r) => r.id));
  }

  if (!fileIds.length) throw new Error("No files found matching keywords");

  return Array.from(new Set(fileIds));
}

async function findEntityOfTypeForKeyword(
  entityTypePlural: string,
  keyword: string,
  ids: string[],
  foundEntity: boolean,
  client: pg.PoolClient,
  query: string
): Promise<boolean> {
  const result = await client.query<{ id: string }>(query, [keyword]);
  if (result.rows.length > 0) {
    if (foundEntity)
      throw new Error(
        `Found multiple entities for keyword ${JSON.stringify(keyword)}`
      );
    if (result.rows.length > 1)
      throw new Error(
        `Found multiple ${entityTypePlural} for keyword ${JSON.stringify(
          keyword
        )}`
      );
    if (result.rows.length === 1) {
      ids.push(result.rows[0].id);
      return true;
    }
  }
  return foundEntity;
}
