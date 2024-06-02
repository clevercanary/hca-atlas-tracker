import { dequal } from "dequal";
import DOMPurify from "isomorphic-dompurify";
import pg from "pg";
import { TASK_STATUS_BY_VALIDATION_STATUS } from "../apis/catalog/hca-atlas-tracker/common/constants";
import {
  DBEntityOfType,
  ENTITY_TYPE,
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBSourceDataset,
  HCAAtlasTrackerDBValidation,
  HCAAtlasTrackerDBValidationUpdateColumns,
  HCAAtlasTrackerDBValidationWithAtlasProperties,
  HCAAtlasTrackerValidationResult,
  PublicationInfo,
  SYSTEM,
  ValidationDifference,
  VALIDATION_ID,
  VALIDATION_STATUS,
  VALIDATION_TYPE,
  VALIDATION_VARIABLE,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import {
  dbSourceDatasetToApiSourceDataset,
  getPublicationDois,
  getSourceDatasetCitation,
} from "../apis/catalog/hca-atlas-tracker/common/utils";
import { NotFoundError } from "../utils/api-handler";
import { ProjectInfo } from "../utils/hca-projects";
import { updateTaskCounts } from "./atlases";
import { getPoolClient, query } from "./database";
import { getProjectInfoByDoi } from "./hca-projects";

interface ValidationStatusInfo {
  differences?: ValidationDifference[];
  relatedEntityUrl?: string;
  status: VALIDATION_STATUS;
}

interface ValidationDefinition<T> {
  description: string;
  system: SYSTEM;
  validate: (entity: T) => ValidationStatusInfo | null; // null indicates that the validation doesn't apply to the passed entity
  validationId: VALIDATION_ID;
  validationType: VALIDATION_TYPE;
}

type TypeSpecificValidationProperties = Pick<
  HCAAtlasTrackerValidationResult,
  "atlasIds" | "entityTitle" | "doi" | "publicationString"
>;

// Properties to check for equality between a validation result and corresponding record to determine whether the record should be updated
const CHANGE_INDICATING_VALIDATION_KEYS = [
  "description",
  "differences",
  "doi",
  "entityTitle",
  "publicationString",
  "relatedEntityUrl",
  "taskStatus",
  "validationStatus",
] as const;

const DESCRIPTION = {
  ADD_PRIMARY_DATA: "Add primary data.",
  INGEST_SOURCE_DATASET: "Ingest source dataset.",
  UPDATE_TITLE_TO_MATCH_PUBLICATION:
    "Update project title to match publication title.",
};

export const SOURCE_DATASET_VALIDATIONS: ValidationDefinition<HCAAtlasTrackerDBSourceDataset>[] =
  [
    {
      description: DESCRIPTION.INGEST_SOURCE_DATASET,
      system: SYSTEM.CAP,
      validate(sourceDataset): ValidationStatusInfo {
        return {
          status: sourceDataset.sd_info.cellxgeneCollectionId
            ? passedIfTruthy(sourceDataset.sd_info.capId)
            : VALIDATION_STATUS.BLOCKED,
        };
      },
      validationId: VALIDATION_ID.SOURCE_DATASET_IN_CAP,
      validationType: VALIDATION_TYPE.INGEST,
    },
    {
      description: DESCRIPTION.INGEST_SOURCE_DATASET,
      system: SYSTEM.CELLXGENE,
      validate(sourceDataset): ValidationStatusInfo {
        return {
          status: passedIfTruthy(sourceDataset.sd_info.cellxgeneCollectionId),
        };
      },
      validationId: VALIDATION_ID.SOURCE_DATASET_IN_CELLXGENE,
      validationType: VALIDATION_TYPE.INGEST,
    },
    {
      description: DESCRIPTION.INGEST_SOURCE_DATASET,
      system: SYSTEM.HCA_DATA_REPOSITORY,
      validate(sourceDataset): ValidationStatusInfo {
        return {
          status: passedIfTruthy(sourceDataset.sd_info.hcaProjectId),
        };
      },
      validationId: VALIDATION_ID.SOURCE_DATASET_IN_HCA_DATA_REPOSITORY,
      validationType: VALIDATION_TYPE.INGEST,
    },
    {
      description: DESCRIPTION.UPDATE_TITLE_TO_MATCH_PUBLICATION,
      system: SYSTEM.HCA_DATA_REPOSITORY,
      validate(sourceDataset): ValidationStatusInfo | null {
        return validateSourceDatasetHcaProjectInfo(
          sourceDataset,
          (projectInfo, infoProperties, publication) => {
            const expected = publication.title;
            const actual = projectInfo?.title ?? null;
            const valid =
              actual === null ? false : titlesMatch(expected, actual);
            const info: ValidationStatusInfo = {
              ...infoProperties,
              status: passedIfTruthy(valid),
            };
            if (!valid)
              info.differences = [
                {
                  actual,
                  expected,
                  variable: VALIDATION_VARIABLE.TITLE,
                },
              ];
            return info;
          }
        );
      },
      validationId:
        VALIDATION_ID.SOURCE_DATASET_TITLE_MATCHES_HCA_DATA_REPOSITORY,
      validationType: VALIDATION_TYPE.METADATA,
    },
    {
      description: DESCRIPTION.ADD_PRIMARY_DATA,
      system: SYSTEM.HCA_DATA_REPOSITORY,
      validate(sourceDataset): ValidationStatusInfo | null {
        return validateSourceDatasetHcaProjectInfo(
          sourceDataset,
          (projectInfo, infoProperties) => ({
            ...infoProperties,
            status: passedIfTruthy(projectInfo?.hasPrimaryData),
          })
        );
      },
      validationId: VALIDATION_ID.SOURCE_DATASET_HCA_PROJECT_HAS_PRIMARY_DATA,
      validationType: VALIDATION_TYPE.INGEST,
    },
  ];

/**
 * Apply a validation that uses a source dataset's HCA project info, skipping the validation if the source dataset's properties indicate it isn't in the HCA Data Repository.
 * @param sourceDataset - Source dataset to validate.
 * @param validate - Validation function that receives the project info (if found), properties for the validation status info, and the source dataset's publication.
 * @returns result of applying the validation function, or null if the source dataset doesn't appear to be in the HCA Data Repository.
 */
function validateSourceDatasetHcaProjectInfo(
  sourceDataset: HCAAtlasTrackerDBSourceDataset,
  validate: (
    projectInfo: ProjectInfo | null,
    infoProperties: Partial<ValidationStatusInfo>,
    publication: PublicationInfo
  ) => ValidationStatusInfo | null
): ValidationStatusInfo | null {
  if (
    !sourceDataset.doi ||
    !sourceDataset.sd_info.publication ||
    !sourceDataset.sd_info.hcaProjectId
  ) {
    return null;
  }
  const projectInfo = getProjectInfoByDoi(
    getPublicationDois(sourceDataset.doi, sourceDataset.sd_info.publication)
  );
  const infoProperties = {
    relatedEntityUrl: `https://explore.data.humancellatlas.org/projects/${encodeURIComponent(
      sourceDataset.sd_info.hcaProjectId
    )}`,
  };
  return validate(
    projectInfo,
    infoProperties,
    sourceDataset.sd_info.publication
  );
}

/**
 * Get validation records from the database.
 * @param ids - IDs of specific records to get; if omitted, gets all records.
 * @param client - If specified, Postgres client to use.
 * @returns validation records.
 */
export async function getValidationRecords(
  ids?: string[],
  client?: pg.PoolClient
): Promise<HCAAtlasTrackerDBValidationWithAtlasProperties[]> {
  const queryResult = ids
    ? await query<HCAAtlasTrackerDBValidationWithAtlasProperties>(
        `
          SELECT
            v.*,
            ARRAY_AGG(DISTINCT concat(a.overview->>'shortName', ' v', a.overview->>'version')) AS atlas_names,
            ARRAY_AGG(DISTINCT a.overview->>'shortName') AS atlas_short_names,
            ARRAY_AGG(DISTINCT a.overview->>'network') AS networks,
            ARRAY_AGG(DISTINCT a.overview->>'wave') AS waves
          FROM hat.validations v
          LEFT JOIN hat.atlases a ON a.id = ANY(v.atlas_ids)
          WHERE v.id=ANY($1)
          GROUP BY v.entity_id, v.validation_id;
        `,
        [ids],
        client
      )
    : await query<HCAAtlasTrackerDBValidationWithAtlasProperties>(
        `
          SELECT
            v.*,
            ARRAY_AGG(DISTINCT concat(a.overview->>'shortName', ' v', a.overview->>'version')) AS atlas_names,
            ARRAY_AGG(DISTINCT a.overview->>'shortName') AS atlas_short_names,
            ARRAY_AGG(DISTINCT a.overview->>'network') AS networks,
            ARRAY_AGG(DISTINCT a.overview->>'wave') AS waves
          FROM hat.validations v
          LEFT JOIN hat.atlases a ON a.id = ANY(v.atlas_ids)
          GROUP BY v.entity_id, v.validation_id;
        `,
        undefined,
        client
      );
  return queryResult.rows;
}

/**
 * Apply a given validation to a given entity.
 * @param entityType - Type of the entity.
 * @param validation - Validation to apply.
 * @param entity - Entity to validate.
 * @param typeSpecificProperties - Properties to add to the validation result that vary by entity type.
 * @returns validation result for the given entity and validation.
 */
function getValidationResult<T extends ENTITY_TYPE>(
  entityType: T,
  validation: ValidationDefinition<DBEntityOfType<T>>,
  entity: DBEntityOfType<T>,
  typeSpecificProperties: TypeSpecificValidationProperties
): HCAAtlasTrackerValidationResult | null {
  const validationStatusInfo = validation.validate(entity);
  if (validationStatusInfo === null) return null;
  const validationStatus = validationStatusInfo.status;
  return {
    description: validation.description,
    differences: validationStatusInfo.differences ?? [],
    entityId: entity.id,
    entityType,
    relatedEntityUrl: validationStatusInfo.relatedEntityUrl ?? null,
    system: validation.system,
    taskStatus: TASK_STATUS_BY_VALIDATION_STATUS[validationStatus],
    validationId: validation.validationId,
    validationStatus,
    validationType: validation.validationType,
    ...typeSpecificProperties,
  };
}

/**
 * Revalidate all source datasets and update atlas task counts.
 */
export async function refreshValidations(): Promise<void> {
  await revalidateAllSourceDatasets();
  await updateTaskCounts();
}

/**
 * Update validations for all source datasets in the database.
 */
async function revalidateAllSourceDatasets(): Promise<void> {
  const client = await getPoolClient();
  const sourceDatasets = (
    await client.query<HCAAtlasTrackerDBSourceDataset>(
      "SELECT * FROM hat.source_datasets"
    )
  ).rows;
  for (const dataset of sourceDatasets) {
    try {
      await client.query("BEGIN");
      await updateSourceDatasetValidations(dataset, client);
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      client.release();
      throw e;
    }
  }
  client.release();
}

/**
 * Update saved validations for the given source dataset.
 * @param sourceDataset - Source dataset to validate.
 * @param client - Postgres client to use.
 */
export async function updateSourceDatasetValidations(
  sourceDataset: HCAAtlasTrackerDBSourceDataset,
  client: pg.PoolClient
): Promise<void> {
  const validationResults = await getSourceDatasetValidationResults(
    sourceDataset,
    client
  );

  await updateValidations(sourceDataset.id, validationResults, client);
}

/**
 * Update saved validations for the given entity based on the given validation results.
 * @param entityId - ID of validated entity.
 * @param validationResults - Validation results to save.
 * @param client - Postgres client to use.
 */
export async function updateValidations(
  entityId: string,
  validationResults: HCAAtlasTrackerValidationResult[],
  client: pg.PoolClient
): Promise<void> {
  const { rows: existingValidations } =
    await client.query<HCAAtlasTrackerDBValidation>(
      "SELECT * FROM hat.validations WHERE entity_id=$1",
      [entityId]
    );

  const existingValidationsById = new Map(
    existingValidations.map((validation) => [
      validation.validation_id,
      validation,
    ])
  );

  const validationIdsToDelete = new Set(
    existingValidations.map((validation) => validation.validation_id)
  );

  // Insert and update from new results
  for (const result of validationResults) {
    // Remove ID from list of validation records to delete
    validationIdsToDelete.delete(result.validationId);

    const existingValidation = existingValidationsById.get(result.validationId);

    const resolvedAt =
      result.validationStatus === VALIDATION_STATUS.PASSED
        ? existingValidation?.resolved_at ?? new Date()
        : null;

    const newColumns: HCAAtlasTrackerDBValidationUpdateColumns = {
      atlas_ids: result.atlasIds,
      entity_id: result.entityId,
      resolved_at: resolvedAt,
      validation_id: result.validationId,
      validation_info: {
        description: result.description,
        differences: result.differences,
        doi: result.doi,
        entityTitle: result.entityTitle,
        entityType: result.entityType,
        publicationString: result.publicationString,
        relatedEntityUrl: result.relatedEntityUrl,
        system: result.system,
        taskStatus: result.taskStatus,
        validationStatus: result.validationStatus,
        validationType: result.validationType,
      },
    };

    if (existingValidation) {
      // Update existing validation record if needed
      if (!shouldUpdateValidation(existingValidation, result)) continue;
      await client.query(
        "UPDATE hat.validations SET atlas_ids=$1, resolved_at=$2, validation_info=$3 WHERE id=$4",
        [
          newColumns.atlas_ids,
          newColumns.resolved_at,
          JSON.stringify(newColumns.validation_info),
          existingValidation.id,
        ]
      );
    } else {
      // Insert new validation record if the record doesn't already exist
      await client.query(
        "INSERT INTO hat.validations (atlas_ids, entity_id, resolved_at, validation_id, validation_info) VALUES ($1, $2, $3, $4, $5)",
        [
          newColumns.atlas_ids,
          newColumns.entity_id,
          newColumns.resolved_at,
          newColumns.validation_id,
          JSON.stringify(newColumns.validation_info),
        ]
      );
    }
  }

  // Delete validation records not present in validation results
  await client.query(
    "DELETE FROM hat.validations WHERE entity_id=$1 AND validation_id=ANY($2)",
    [entityId, Array.from(validationIdsToDelete)]
  );
}

/**
 * Determine whether the given validation result represents a change to the given validation record.
 * @param existingValidation - Existing validation record.
 * @param validationResult - Validation result.
 * @returns true if the validation record should be updated to match the validation result.
 */
function shouldUpdateValidation(
  existingValidation: HCAAtlasTrackerDBValidation,
  validationResult: HCAAtlasTrackerValidationResult
): boolean {
  if (!dequal(existingValidation.atlas_ids, validationResult.atlasIds))
    return true;
  for (const key of CHANGE_INDICATING_VALIDATION_KEYS) {
    if (!dequal(existingValidation.validation_info[key], validationResult[key]))
      return true;
  }
  return false;
}

/**
 * Get validation results for the given source dataset.
 * @param sourceDataset - Source dataset to validate.
 * @param client - Postgres client to use.
 * @returns validation results.
 */
export async function getSourceDatasetValidationResults(
  sourceDataset: HCAAtlasTrackerDBSourceDataset,
  client: pg.PoolClient
): Promise<HCAAtlasTrackerValidationResult[]> {
  const validationResults: HCAAtlasTrackerValidationResult[] = [];
  const title = getSourceDatasetTitle(sourceDataset);
  const atlasIds = await getSourceDatasetAtlasIds(sourceDataset, client);
  for (const validation of SOURCE_DATASET_VALIDATIONS) {
    const validationResult = getValidationResult(
      ENTITY_TYPE.SOURCE_DATASET,
      validation,
      sourceDataset,
      {
        atlasIds,
        doi: sourceDataset.doi,
        entityTitle: title,
        publicationString: getSourceDatasetCitation(
          dbSourceDatasetToApiSourceDataset(sourceDataset)
        ),
      }
    );
    if (!validationResult) continue;
    validationResults.push(validationResult);
  }
  return validationResults;
}

/**
 * Get the published, unpublished, or fallback title for the given source dataset.
 * @param sourceDataset - Source dataset.
 * @returns source dataset title.
 */
function getSourceDatasetTitle(
  sourceDataset: HCAAtlasTrackerDBSourceDataset
): string {
  return (
    sourceDataset.sd_info.publication?.title ??
    sourceDataset.sd_info.unpublishedInfo?.title ??
    sourceDataset.id
  );
}

/**
 * Get IDs of atlases containing the given source dataset.
 * @param sourceDataset - Source dataset.
 * @param client - Postgres client to use.
 * @returns atlas IDs.
 */
async function getSourceDatasetAtlasIds(
  sourceDataset: HCAAtlasTrackerDBSourceDataset,
  client: pg.PoolClient
): Promise<string[]> {
  const queryResult = await client.query<Pick<HCAAtlasTrackerDBAtlas, "id">>(
    "SELECT id FROM hat.atlases WHERE source_datasets @> $1",
    [JSON.stringify(sourceDataset.id)]
  );
  return Array.from(new Set(queryResult.rows.map(({ id }) => id)));
}

/**
 * Set target completion for the given validations to the given date, or to null.
 * @param targetCompletion - Target completion date or null.
 * @param validationIds - Validation IDs.
 * @returns updated validation records.
 */
export async function updateTargetCompletions(
  targetCompletion: Date | null,
  validationIds: string[]
): Promise<HCAAtlasTrackerDBValidationWithAtlasProperties[]> {
  const client = await getPoolClient();
  try {
    client.query("BEGIN");
    const queryResult = await client.query(
      "UPDATE hat.validations SET target_completion=$1 WHERE id=ANY($2)",
      [targetCompletion, validationIds]
    );
    if (queryResult.rowCount !== validationIds.length)
      throw new NotFoundError(
        "One or more of the specified validations do not exist"
      );
    const results = await getValidationRecords(validationIds, client);
    client.query("COMMIT");
    return results;
  } catch (e) {
    client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

/**
 * Determine whether two titles are similar enough to be considered the same.
 * @param a - First title.
 * @param b - Second title.
 * @returns true if the titles match.
 */
function titlesMatch(a: string, b: string): boolean {
  return simplifyString(a) === simplifyString(b);

  function simplifyString(s: string): string {
    return DOMPurify.sanitize(s, { ALLOWED_TAGS: ["#text"] })
      .normalize("NFKD")
      .toLowerCase()
      .replace(/[\p{P}\p{S}]/gu, "")
      .replace(/\s+/g, " ")
      .trim();
  }
}

/**
 * Returns PASSED if the given value is truthy, or FAILED otherwise.
 * @param value - Value to check.
 * @returns validation status.
 */
function passedIfTruthy(value: unknown): VALIDATION_STATUS {
  return value ? VALIDATION_STATUS.PASSED : VALIDATION_STATUS.FAILED;
}
