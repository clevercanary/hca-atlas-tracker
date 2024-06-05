import { dequal } from "dequal";
import DOMPurify from "isomorphic-dompurify";
import pg from "pg";
import {
  TASK_STATUS_BY_VALIDATION_STATUS,
  VALIDATION_DESCRIPTION,
} from "../apis/catalog/hca-atlas-tracker/common/constants";
import {
  DBEntityOfType,
  ENTITY_TYPE,
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBSourceStudy,
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

export const SOURCE_STUDY_VALIDATIONS: ValidationDefinition<HCAAtlasTrackerDBSourceStudy>[] =
  [
    {
      description: VALIDATION_DESCRIPTION.INGEST_SOURCE_STUDY,
      system: SYSTEM.CAP,
      validate(sourceStudy): ValidationStatusInfo {
        return {
          status: sourceStudy.study_info.cellxgeneCollectionId
            ? passedIfTruthy(sourceStudy.study_info.capId)
            : VALIDATION_STATUS.BLOCKED,
        };
      },
      validationId: VALIDATION_ID.SOURCE_STUDY_IN_CAP,
      validationType: VALIDATION_TYPE.INGEST,
    },
    {
      description: VALIDATION_DESCRIPTION.INGEST_SOURCE_STUDY,
      system: SYSTEM.CELLXGENE,
      validate(sourceStudy): ValidationStatusInfo {
        return {
          status: passedIfTruthy(sourceStudy.study_info.cellxgeneCollectionId),
        };
      },
      validationId: VALIDATION_ID.SOURCE_STUDY_IN_CELLXGENE,
      validationType: VALIDATION_TYPE.INGEST,
    },
    {
      description: VALIDATION_DESCRIPTION.INGEST_SOURCE_STUDY,
      system: SYSTEM.HCA_DATA_REPOSITORY,
      validate(sourceStudy): ValidationStatusInfo {
        return {
          status: passedIfTruthy(sourceStudy.study_info.hcaProjectId),
        };
      },
      validationId: VALIDATION_ID.SOURCE_STUDY_IN_HCA_DATA_REPOSITORY,
      validationType: VALIDATION_TYPE.INGEST,
    },
    {
      description: VALIDATION_DESCRIPTION.UPDATE_TITLE_TO_MATCH_PUBLICATION,
      system: SYSTEM.HCA_DATA_REPOSITORY,
      validate(sourceStudy): ValidationStatusInfo | null {
        return validateSourceStudyHcaProjectInfo(
          sourceStudy,
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
        VALIDATION_ID.SOURCE_STUDY_TITLE_MATCHES_HCA_DATA_REPOSITORY,
      validationType: VALIDATION_TYPE.METADATA,
    },
    {
      description: VALIDATION_DESCRIPTION.ADD_PRIMARY_DATA,
      system: SYSTEM.HCA_DATA_REPOSITORY,
      validate(sourceStudy): ValidationStatusInfo | null {
        return validateSourceStudyHcaProjectInfo(
          sourceStudy,
          (projectInfo, infoProperties) => ({
            ...infoProperties,
            status: passedIfTruthy(projectInfo?.hasPrimaryData),
          })
        );
      },
      validationId: VALIDATION_ID.SOURCE_STUDY_HCA_PROJECT_HAS_PRIMARY_DATA,
      validationType: VALIDATION_TYPE.INGEST,
    },
  ];

/**
 * Apply a validation that uses a source study's HCA project info, skipping the validation if the source study's properties indicate it isn't in the HCA Data Repository.
 * @param sourceStudy - Source study to validate.
 * @param validate - Validation function that receives the project info (if found), properties for the validation status info, and the source study's publication.
 * @returns result of applying the validation function, or null if the source study doesn't appear to be in the HCA Data Repository.
 */
function validateSourceStudyHcaProjectInfo(
  sourceStudy: HCAAtlasTrackerDBSourceStudy,
  validate: (
    projectInfo: ProjectInfo | null,
    infoProperties: Partial<ValidationStatusInfo>,
    publication: PublicationInfo
  ) => ValidationStatusInfo | null
): ValidationStatusInfo | null {
  if (
    !sourceStudy.doi ||
    !sourceStudy.study_info.publication ||
    !sourceStudy.study_info.hcaProjectId
  ) {
    return null;
  }
  const projectInfo = getProjectInfoByDoi(
    getPublicationDois(sourceStudy.doi, sourceStudy.study_info.publication)
  );
  const infoProperties = {
    relatedEntityUrl: `https://explore.data.humancellatlas.org/projects/${encodeURIComponent(
      sourceStudy.study_info.hcaProjectId
    )}`,
  };
  return validate(
    projectInfo,
    infoProperties,
    sourceStudy.study_info.publication
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
 * Revalidate all source studies and update atlas task counts.
 */
export async function refreshValidations(): Promise<void> {
  await revalidateAllSourceStudies();
  await updateTaskCounts();
}

/**
 * Update validations for all source studies in the database.
 */
async function revalidateAllSourceStudies(): Promise<void> {
  const client = await getPoolClient();
  const sourceStudies = (
    await client.query<HCAAtlasTrackerDBSourceStudy>(
      "SELECT * FROM hat.source_studies"
    )
  ).rows;
  for (const dataset of sourceStudies) {
    try {
      await client.query("BEGIN");
      await updateSourceStudyValidations(dataset, client);
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
 * Update saved validations for the given source study.
 * @param sourceStudy - Source study to validate.
 * @param client - Postgres client to use.
 */
export async function updateSourceStudyValidations(
  sourceStudy: HCAAtlasTrackerDBSourceStudy,
  client: pg.PoolClient
): Promise<void> {
  const validationResults = await getSourceStudyValidationResults(
    sourceStudy,
    client
  );

  await updateValidations(sourceStudy.id, validationResults, client);
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
 * Get validation results for the given source study.
 * @param sourceStudy - Source study to validate.
 * @param client - Postgres client to use.
 * @returns validation results.
 */
export async function getSourceStudyValidationResults(
  sourceStudy: HCAAtlasTrackerDBSourceStudy,
  client: pg.PoolClient
): Promise<HCAAtlasTrackerValidationResult[]> {
  const validationResults: HCAAtlasTrackerValidationResult[] = [];
  const title = getSourceStudyTitle(sourceStudy);
  const atlasIds = await getSourceStudyAtlasIds(sourceStudy, client);
  for (const validation of SOURCE_STUDY_VALIDATIONS) {
    const validationResult = getValidationResult(
      ENTITY_TYPE.SOURCE_STUDY,
      validation,
      sourceStudy,
      {
        atlasIds,
        doi: sourceStudy.doi,
        entityTitle: title,
        publicationString: getSourceDatasetCitation(
          dbSourceDatasetToApiSourceDataset(sourceStudy)
        ),
      }
    );
    if (!validationResult) continue;
    validationResults.push(validationResult);
  }
  return validationResults;
}

/**
 * Get the published, unpublished, or fallback title for the given source study.
 * @param sourceStudy - Source study.
 * @returns source study title.
 */
function getSourceStudyTitle(
  sourceStudy: HCAAtlasTrackerDBSourceStudy
): string {
  return (
    sourceStudy.study_info.publication?.title ??
    sourceStudy.study_info.unpublishedInfo?.title ??
    sourceStudy.id
  );
}

/**
 * Get IDs of atlases containing the given source study.
 * @param sourceStudy - Source study.
 * @param client - Postgres client to use.
 * @returns atlas IDs.
 */
async function getSourceStudyAtlasIds(
  sourceStudy: HCAAtlasTrackerDBSourceStudy,
  client: pg.PoolClient
): Promise<string[]> {
  const queryResult = await client.query<Pick<HCAAtlasTrackerDBAtlas, "id">>(
    "SELECT id FROM hat.atlases WHERE source_studies @> $1",
    [JSON.stringify(sourceStudy.id)]
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
