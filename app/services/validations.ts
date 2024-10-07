import { NewCommentThreadData } from "app/apis/catalog/hca-atlas-tracker/common/schema";
import { dequal } from "dequal";
import DOMPurify from "isomorphic-dompurify";
import pg from "pg";
import {
  ALLOWED_TASK_STATUSES_BY_VALIDATION_STATUS,
  DEFAULT_TASK_STATUS_BY_VALIDATION_STATUS,
  VALIDATION_DESCRIPTION,
  VALIDATION_STATUS_BY_TASK_STATUS,
} from "../apis/catalog/hca-atlas-tracker/common/constants";
import {
  ENTITY_TYPE,
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBComment,
  HCAAtlasTrackerDBSourceStudy,
  HCAAtlasTrackerDBSourceStudyWithAtlasProperties,
  HCAAtlasTrackerDBUser,
  HCAAtlasTrackerDBValidation,
  HCAAtlasTrackerDBValidationUpdateColumns,
  HCAAtlasTrackerDBValidationWithAtlasProperties,
  HCAAtlasTrackerValidationResult,
  PublicationInfo,
  SYSTEM,
  TaskStatusesUpdatedByDOIResult,
  TASK_STATUS,
  ValidationDBEntityOfType,
  ValidationDifference,
  VALIDATION_ID,
  VALIDATION_STATUS,
  VALIDATION_TYPE,
  VALIDATION_VARIABLE,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import { getDbEntityCitation } from "../apis/catalog/hca-atlas-tracker/common/utils";
import { ForbiddenError, NotFoundError } from "../utils/api-handler";
import { ProjectInfo } from "../utils/hca-projects";
import { updateTaskCounts } from "./atlases";
import { createCommentThread, deleteCommentThread } from "./comments";
import { doTransaction, getPoolClient, query } from "./database";
import { getProjectInfoById } from "./hca-projects";
import {
  getSourceStudiesByDois,
  getSourceStudiesWithAtlasProperties,
} from "./source-studies";

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
  "validationStatus",
] as const;

export const SOURCE_STUDY_VALIDATIONS: ValidationDefinition<HCAAtlasTrackerDBSourceStudyWithAtlasProperties>[] =
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
            if (!publication) return null;
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
    {
      description: VALIDATION_DESCRIPTION.LINK_PROJECT_BIONETWORKS_AND_ATLASES,
      system: SYSTEM.HCA_DATA_REPOSITORY,
      validate(sourceStudy): ValidationStatusInfo | null {
        return validateSourceStudyHcaProjectInfo(
          sourceStudy,
          (projectInfo, infoProperties) => {
            if (!projectInfo) {
              return {
                ...infoProperties,
                differences: [
                  {
                    actual: null,
                    expected: sourceStudy.networks,
                    variable: VALIDATION_VARIABLE.NETWORKS,
                  },
                  {
                    actual: null,
                    expected: sourceStudy.atlas_names,
                    variable: VALIDATION_VARIABLE.ATLASES,
                  },
                ],
                status: VALIDATION_STATUS.FAILED,
              };
            }
            const projectAtlasNames = projectInfo.atlases.map(
              ({ shortName, version }) => shortName + " " + version
            );
            const projectNetworksLower = projectInfo.networks.map((name) =>
              name.toLowerCase()
            );
            const atlasesMatch =
              sourceStudy.atlas_names.length === projectAtlasNames.length &&
              sourceStudy.atlas_names.every((name) =>
                projectAtlasNames.includes(name)
              );
            const networksMatch =
              sourceStudy.networks.length === projectNetworksLower.length &&
              sourceStudy.networks.every((name) =>
                projectNetworksLower.includes(name.toLocaleLowerCase())
              );
            const info: ValidationStatusInfo = {
              ...infoProperties,
              status: VALIDATION_STATUS.PASSED,
            };
            if (!(networksMatch && atlasesMatch)) {
              info.status = VALIDATION_STATUS.FAILED;
              info.differences = [];
              if (!networksMatch)
                info.differences.push({
                  actual: projectInfo.networks,
                  expected: sourceStudy.networks,
                  variable: VALIDATION_VARIABLE.NETWORKS,
                });
              if (!atlasesMatch)
                info.differences.push({
                  actual: projectAtlasNames,
                  expected: sourceStudy.atlas_names,
                  variable: VALIDATION_VARIABLE.ATLASES,
                });
            }
            return info;
          }
        );
      },
      validationId:
        VALIDATION_ID.SOURCE_STUDY_HCA_PROJECT_HAS_LINKED_BIONETWORKS_AND_ATLASES,
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
    publication: PublicationInfo | null
  ) => ValidationStatusInfo | null
): ValidationStatusInfo | null {
  if (!sourceStudy.study_info.hcaProjectId) {
    return null;
  }
  const projectInfo = getProjectInfoById(sourceStudy.study_info.hcaProjectId);
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
            ARRAY_AGG(DISTINCT a.overview->>'version') AS atlas_versions,
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
            ARRAY_AGG(DISTINCT a.overview->>'version') AS atlas_versions,
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
 * Get basic validation records for the given entities.
 * @param entityIds - Entities to get validations for.
 * @param client - Postgres client to use.
 * @returns validation records.
 */
export async function getValidationRecordsWithoutAtlasPropertiesForEntities(
  entityIds: string[],
  client: pg.PoolClient
): Promise<HCAAtlasTrackerDBValidation[]> {
  return (
    await client.query<HCAAtlasTrackerDBValidation>(
      "SELECT * FROM hat.validations WHERE entity_id=ANY($1)",
      [entityIds]
    )
  ).rows;
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
  validation: ValidationDefinition<ValidationDBEntityOfType<T>>,
  entity: ValidationDBEntityOfType<T>,
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
  for (const study of await getSourceStudiesWithAtlasProperties(client)) {
    try {
      await client.query("BEGIN");
      await updateSourceStudyValidations(study, client);
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
  sourceStudy: HCAAtlasTrackerDBSourceStudyWithAtlasProperties,
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
    await updateValidation(result, existingValidation, client);
  }

  // Delete validation records not present in validation results, as well as any associated comment threads
  const deletedValidationsInfo = (
    await client.query<Pick<HCAAtlasTrackerDBValidation, "comment_thread_id">>(
      "DELETE FROM hat.validations WHERE entity_id=$1 AND validation_id=ANY($2) RETURNING comment_thread_id",
      [entityId, Array.from(validationIdsToDelete)]
    )
  ).rows;
  for (const { comment_thread_id: threadId } of deletedValidationsInfo) {
    if (threadId !== null) await deleteCommentThread(threadId, client);
  }
}

async function updateValidation(
  result: HCAAtlasTrackerValidationResult,
  existingValidation: HCAAtlasTrackerDBValidation | undefined,
  client: pg.PoolClient
): Promise<void> {
  const existingTaskStatus = existingValidation?.validation_info.taskStatus;

  const resolvedAt =
    result.validationStatus === VALIDATION_STATUS.PASSED
      ? existingValidation?.resolved_at ?? new Date()
      : null;

  const taskStatus =
    existingTaskStatus &&
    ALLOWED_TASK_STATUSES_BY_VALIDATION_STATUS[
      result.validationStatus
    ].includes(existingTaskStatus)
      ? existingTaskStatus
      : DEFAULT_TASK_STATUS_BY_VALIDATION_STATUS[result.validationStatus];

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
      taskStatus,
      validationStatus: result.validationStatus,
      validationType: result.validationType,
    },
  };

  if (existingValidation) {
    // Update existing validation record if needed
    if (!shouldUpdateValidation(existingValidation, result)) return;
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
  sourceStudy: HCAAtlasTrackerDBSourceStudyWithAtlasProperties,
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
        publicationString: getDbEntityCitation(sourceStudy),
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
 * Where possible, set the task statuses of validations of the given type for source studies with any of the given DOIs to the given task status.
 * @param dois - DOIs to update source study validations for.
 * @param validationId - Type of validation to update.
 * @param status - Task status to set.
 * @returns lists of updated, not updated, and not found DOIs.
 */
export async function updateSourceStudyTaskStatusesByDois(
  dois: string[],
  validationId: VALIDATION_ID,
  status: TASK_STATUS
): Promise<TaskStatusesUpdatedByDOIResult> {
  return await doTransaction(async (client) => {
    // Get source studies with the given DOIs

    const sourceStudies = await getSourceStudiesByDois(dois, client);
    const sourceStudyIds = sourceStudies.map(({ id }) => id);

    // Calculate info about found and not found DOIs

    const foundDoiBySourceStudyId = new Map<string, string>();
    const notFoundDois = new Set(dois);
    for (const sourceStudy of sourceStudies) {
      const studyDois = [
        sourceStudy.doi,
        sourceStudy.study_info.publication?.hasPreprintDoi,
        sourceStudy.study_info.publication?.preprintOfDoi,
      ];
      for (const doi of studyDois) {
        if (doi && notFoundDois.has(doi)) {
          foundDoiBySourceStudyId.set(sourceStudy.id, doi);
          notFoundDois.delete(doi);
        }
      }
    }

    // Update validations

    const allowedValidationStatus = VALIDATION_STATUS_BY_TASK_STATUS[status];

    const updatedValidationSourceStudyIds = (
      await client.query<Pick<HCAAtlasTrackerDBValidation, "entity_id">>(
        `
          UPDATE hat.validations
          SET validation_info=validation_info||jsonb_build_object('taskStatus', $1)
          WHERE
            validation_info->>'entityType'='SOURCE_STUDY'
            AND validation_id=$2
            AND validation_info->>'validationStatus'=$3
            AND NOT validation_info->>'taskStatus'=$1
            AND entity_id=ANY($4)
          RETURNING entity_id
        `,
        [status, validationId, allowedValidationStatus, sourceStudyIds]
      )
    ).rows.map((v) => v.entity_id);

    // Calculate info about non-updated validations

    const notUpdatedSourceStudyIds = sourceStudyIds.filter(
      (id) => !updatedValidationSourceStudyIds.includes(id)
    );

    const unchangedValidationsInfo = (
      await client.query<{ id: string; task_status: TASK_STATUS }>(
        `
          SELECT
            entity_id AS id,
            validation_info->>'taskStatus' AS task_status
          FROM hat.validations
          WHERE validation_id=$1 AND entity_id=ANY($2)
        `,
        [validationId, notUpdatedSourceStudyIds]
      )
    ).rows;

    // Create result

    const result: TaskStatusesUpdatedByDOIResult = {
      notFound: Array.from(notFoundDois),
      notUpdated: {
        [TASK_STATUS.BLOCKED]: [],
        [TASK_STATUS.DONE]: [],
        [TASK_STATUS.IN_PROGRESS]: [],
        [TASK_STATUS.TODO]: [],
      },
      updated: updatedValidationSourceStudyIds.reduce((dois, id) => {
        const doi = foundDoiBySourceStudyId.get(id);
        if (doi !== undefined) dois.push(doi);
        return dois;
      }, [] as string[]),
    };

    for (const { id, task_status: taskStatus } of unchangedValidationsInfo) {
      const doi = foundDoiBySourceStudyId.get(id);
      if (doi !== undefined) result.notUpdated[taskStatus].push(doi);
    }

    return result;
  });
}

/**
 * Create a new comment thread and add it to the given validation.
 * @param validationId - ID of the validation to add the comment thread to.
 * @param inputData - Values for the new comment thread.
 * @param user - User creating the comment thread.
 * @returns database model of new comment.
 */
export async function createValidationComment(
  validationId: string,
  inputData: NewCommentThreadData,
  user: HCAAtlasTrackerDBUser
): Promise<HCAAtlasTrackerDBComment> {
  return await doTransaction(async (client) => {
    const existingThreadResult = await client.query<
      Pick<HCAAtlasTrackerDBValidation, "comment_thread_id">
    >("SELECT comment_thread_id FROM hat.validations WHERE id=$1", [
      validationId,
    ]);
    if (existingThreadResult.rows.length === 0)
      throw new NotFoundError(
        `Validation with ID ${validationId} doesn't exist`
      );
    const existingThreadId = existingThreadResult.rows[0].comment_thread_id;
    if (existingThreadId !== null)
      throw new ForbiddenError("Comment thread already exists");
    const newComment = await createCommentThread(inputData, user, client);
    await client.query(
      "UPDATE hat.validations SET comment_thread_id=$1 WHERE id=$2",
      [newComment.thread_id, validationId]
    );
    return newComment;
  });
}

/**
 * Delete the comment thread associated with a given validation.
 * @param validationId - ID of the validation to delete the comment thread from.
 * @returns promise.
 */
export async function deleteValidationComment(
  validationId: string
): Promise<void> {
  return await doTransaction(async (client) => {
    const existingThreadResult = await client.query<
      Pick<HCAAtlasTrackerDBValidation, "comment_thread_id">
    >("SELECT comment_thread_id FROM hat.validations WHERE id=$1", [
      validationId,
    ]);
    if (existingThreadResult.rows.length === 0)
      throw new NotFoundError(
        `Validation with ID ${validationId} doesn't exist`
      );
    const existingThreadId = existingThreadResult.rows[0].comment_thread_id;
    if (existingThreadId === null)
      throw new NotFoundError("No comment thread exists for the validation");
    await client.query(
      "UPDATE hat.validations SET comment_thread_id=NULL WHERE id=$1",
      [validationId]
    );
    await deleteCommentThread(existingThreadId, client);
  });
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
