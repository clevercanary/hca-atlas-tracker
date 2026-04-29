import pg from "pg";
import {
  DatasetValidatorToolReport,
  DatasetValidatorToolReports,
} from "../app/apis/catalog/hca-atlas-tracker/aws/schemas";
import { FILE_VALIDATOR_NAMES } from "../app/apis/catalog/hca-atlas-tracker/common/constants";
import {
  FILE_VALIDATION_STATUS,
  FileValidationReports,
  FileValidationSummary,
  HCAAtlasTrackerDBComponentAtlas,
  HCAAtlasTrackerDBFile,
  HCAAtlasTrackerDBFileDatasetInfo,
  HCAAtlasTrackerDBFileValidationInfo,
  HCAAtlasTrackerDBSourceDataset,
  INTEGRITY_STATUS,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { addValidationResultsToFile } from "../app/data/files";
import { doTransaction, endPgPool } from "../app/services/database";
import { toolReportsToValidationReportsAndSummary } from "../app/services/validation-results-notification";

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
const JOB_ERROR_PROBABILITY = 0.5;
const FAILED_REQUEST_PROBABILITY = 0.2;
const OVERALL_VALID_PROBABILITY = 0.5;

// (Below use uninclusive max)

const MIN_CELL_COUNT = 100;
const MAX_CELL_COUNT = 10000;

const MIN_GENE_COUNT = 100;
const MAX_GENE_COUNT = 10000;

const MIN_ARRAY_LENGTH = 1;
const MAX_ARRAY_LENGTH = 6;

const LETTERS = "abcdefghijklmnopqrstuvwxyz";

interface SuccessRelatedFields {
  dataset_info: HCAAtlasTrackerDBFileDatasetInfo | null;
  integrity_status: INTEGRITY_STATUS;
  validation_reports: FileValidationReports | null;
  validation_status: FILE_VALIDATION_STATUS;
  validation_summary: FileValidationSummary | null;
}

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
      Array.from(fileKeysById.values()).join("\n"),
  );

  endPgPool();
}

async function addValidationResultsToFiles(
  fileIds: string[],
  fileKeysById: Map<string, string>,
  client: pg.PoolClient,
): Promise<void> {
  for (const fileId of fileIds) {
    const validatedAt = new Date();
    let successRelatedFields: SuccessRelatedFields;
    if (Math.random() < FAILED_VALIDATION_PROBABILITY) {
      successRelatedFields = getFailedValidationFields();
    } else {
      successRelatedFields = getSuccessfulValidationFields(
        fileKeysById,
        fileId,
      );
    }
    const validationInfo: HCAAtlasTrackerDBFileValidationInfo = {
      batchJobId: `test-batch-job-${crypto.randomUUID()}`,
      snsMessageId: `test-sns-message-${crypto.randomUUID()}`,
      snsMessageTime: validatedAt.toISOString(),
    };
    await addValidationResultsToFile({
      client,
      datasetInfo: successRelatedFields.dataset_info,
      fileId,
      integrityStatus: successRelatedFields.integrity_status,
      validatedAt,
      validationInfo,
      validationReports: successRelatedFields.validation_reports,
      validationStatus: successRelatedFields.validation_status,
      validationSummary: successRelatedFields.validation_summary,
    });
  }
}

function getFailedValidationFields(): SuccessRelatedFields {
  const isJobError = Math.random() < JOB_ERROR_PROBABILITY;
  return {
    dataset_info: null,
    integrity_status: isJobError
      ? INTEGRITY_STATUS.ERROR
      : INTEGRITY_STATUS.INVALID,
    validation_reports: null,
    validation_status: isJobError
      ? FILE_VALIDATION_STATUS.JOB_FAILED
      : FILE_VALIDATION_STATUS.COMPLETED,
    validation_summary: null,
  };
}

function getSuccessfulValidationFields(
  fileKeysById: Map<string, string>,
  fileId: string,
): SuccessRelatedFields {
  const key = fileKeysById.get(fileId);
  const [validationReports, validationSummary] = makeValidationReports();
  return {
    dataset_info: {
      assay: generateArray("assay"),
      cellCount:
        Math.floor(Math.random() * (MAX_CELL_COUNT - MIN_CELL_COUNT)) +
        MIN_CELL_COUNT,
      disease: generateArray("disease"),
      geneCount:
        Math.floor(Math.random() * (MAX_GENE_COUNT - MIN_GENE_COUNT)) +
        MIN_GENE_COUNT,
      suspensionType: generateArray("suspension-type"),
      tissue: generateArray("tissue"),
      title: `Test ${(key && key.split("/").pop()) || fileId}`,
    },
    integrity_status: INTEGRITY_STATUS.VALID,
    validation_reports: validationReports,
    validation_status:
      Math.random() < FAILED_REQUEST_PROBABILITY
        ? FILE_VALIDATION_STATUS.REQUEST_FAILED
        : FILE_VALIDATION_STATUS.COMPLETED,
    validation_summary: validationSummary,
  };
}

function makeValidationReports(): [
  FileValidationReports,
  FileValidationSummary,
] {
  const validatorValidProbability =
    OVERALL_VALID_PROBABILITY ** (1 / FILE_VALIDATOR_NAMES.length);

  const toolReports: DatasetValidatorToolReports = {
    cap: generateToolReport(validatorValidProbability),
    cellxgene: generateToolReport(validatorValidProbability),
    hcaCellAnnotation: generateToolReport(validatorValidProbability),
    hcaSchema: generateToolReport(validatorValidProbability),
  };

  return toolReportsToValidationReportsAndSummary(toolReports);
}

function generateToolReport(
  validatorValidProbability: number,
): DatasetValidatorToolReport {
  const valid = Math.random() < validatorValidProbability;
  const errors = valid
    ? []
    : generateArrayVia((l) => `Error ${l.toUpperCase()}`);
  const warnings =
    Math.random() < 0.5
      ? []
      : generateArrayVia((l) => `Warning ${l.toUpperCase()}`);
  return {
    errors,
    finished_at: new Date().toISOString(),
    started_at: new Date().toISOString(),
    valid,
    warnings,
  };
}

function generateArray(itemBase: string): string[] {
  return generateArrayVia((l) => `${itemBase}-${l}`);
}

function generateArrayVia(makeItem: (letter: string) => string): string[] {
  const lettersLeft = Array.from(LETTERS);
  const amount =
    Math.floor(Math.random() * (MAX_ARRAY_LENGTH - MIN_ARRAY_LENGTH)) +
    MIN_ARRAY_LENGTH;
  const result: string[] = [];
  for (let i = 0; i < amount; i++) {
    const j = Math.floor(Math.random() * lettersLeft.length);
    result.push(makeItem(lettersLeft[j]));
    lettersLeft.splice(j, 1);
  }
  return result;
}

async function getFileKeysById(
  fileIds: string[],
  client: pg.PoolClient,
): Promise<Map<string, string>> {
  const result = await client.query<Pick<HCAAtlasTrackerDBFile, "id" | "key">>(
    "SELECT id, key FROM hat.files WHERE id=ANY($1)",
    [fileIds],
  );
  return new Map(result.rows.map((r) => [r.id, r.key]));
}

async function getFileIdsByEntityKeywords(
  keywords: string[],
  client: pg.PoolClient,
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
          OR LOWER((overview->>'shortName') || ' v' || generation || '.' || revision) = LOWER($1)
      `,
      "id",
    );
    foundEntity = await findEntityOfTypeForKeyword(
      "source datasets",
      keyword,
      sourceDatasetIds,
      foundEntity,
      client,
      "SELECT version_id FROM hat.source_datasets WHERE id::text = $1 AND is_latest",
      "version_id",
    );
    foundEntity = await findEntityOfTypeForKeyword(
      "integrated objects",
      keyword,
      componentAtlasIds,
      foundEntity,
      client,
      "SELECT version_id FROM hat.component_atlases WHERE id::text = $1 AND is_latest",
      "version_id",
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
      `,
      "id",
    );
    if (!foundEntity)
      throw new Error(`No entity found for keyword ${JSON.stringify(keyword)}`);
  }

  if (atlasIds.length) {
    const sourceDatasetsResult = await client.query<
      Pick<HCAAtlasTrackerDBSourceDataset, "version_id">
    >(
      "SELECT d.version_id FROM hat.atlases a JOIN hat.source_datasets d ON d.version_id=ANY(a.source_datasets) WHERE a.id=ANY($1)",
      [atlasIds],
    );
    sourceDatasetIds.push(
      ...sourceDatasetsResult.rows.map((r) => r.version_id),
    );
    const componentAtlasesResult = await client.query<
      Pick<HCAAtlasTrackerDBComponentAtlas, "version_id">
    >(
      "SELECT c.version_id FROM hat.component_atlases c JOIN hat.atlases a ON c.version_id=ANY(a.component_atlases) WHERE a.id=ANY($1)",
      [atlasIds],
    );
    componentAtlasIds.push(
      ...componentAtlasesResult.rows.map((r) => r.version_id),
    );
  }

  if (sourceDatasetIds.length) {
    const result = await client.query<
      Pick<HCAAtlasTrackerDBSourceDataset, "file_id">
    >("SELECT file_id FROM hat.source_datasets WHERE version_id=ANY($1)", [
      sourceDatasetIds,
    ]);
    fileIds.push(...result.rows.map((r) => r.file_id));
  }

  if (componentAtlasIds.length) {
    const result = await client.query<
      Pick<HCAAtlasTrackerDBComponentAtlas, "file_id">
    >("SELECT file_id FROM hat.component_atlases WHERE version_id=ANY($1)", [
      componentAtlasIds,
    ]);
    fileIds.push(...result.rows.map((r) => r.file_id));
  }

  if (!fileIds.length) throw new Error("No files found matching keywords");

  return Array.from(new Set(fileIds));
}

async function findEntityOfTypeForKeyword<TIdKey extends string>(
  entityTypePlural: string,
  keyword: string,
  ids: string[],
  foundEntity: boolean,
  client: pg.PoolClient,
  query: string,
  idKey: TIdKey,
): Promise<boolean> {
  const result = await client.query<Record<TIdKey, string>>(query, [keyword]);
  if (result.rows.length > 0) {
    if (foundEntity)
      throw new Error(
        `Found multiple entities for keyword ${JSON.stringify(keyword)}`,
      );
    if (result.rows.length > 1)
      throw new Error(
        `Found multiple ${entityTypePlural} for keyword ${JSON.stringify(
          keyword,
        )}`,
      );
    if (result.rows.length === 1) {
      ids.push(result.rows[0][idKey]);
      return true;
    }
  }
  return foundEntity;
}
