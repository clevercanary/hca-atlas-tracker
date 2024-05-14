import pg from "pg";
import {
  DBEntityOfType,
  ENTITY_TYPE,
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBSourceDataset,
  HCAAtlasTrackerDBValidation,
  HCAAtlasTrackerDBValidationCreationColumns,
  HCAAtlasTrackerValidationResult,
  SYSTEM,
  TASK_STATUS,
  VALIDATION_ID,
  VALIDATION_STATUS,
  VALIDATION_TYPE,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import {
  dbSourceDatasetToApiSourceDataset,
  getPublicationDois,
  getSourceDatasetCitation,
} from "../apis/catalog/hca-atlas-tracker/common/utils";
import { getProjectInfoByDoi } from "./hca-projects";

interface ValidationDefinition<T> {
  description: string;
  system: SYSTEM;
  validate: (entity: T) => boolean | null;
  validationId: VALIDATION_ID;
  validationType: VALIDATION_TYPE;
}

type ValidationAtlasProperties = Pick<
  HCAAtlasTrackerValidationResult,
  "atlasIds" | "atlasShortNames" | "networks" | "waves"
>;

type TypeSpecificValidationProperties = ValidationAtlasProperties &
  Pick<
    HCAAtlasTrackerValidationResult,
    "entityTitle" | "doi" | "publicationString"
  >;

const CHANGE_INDICATING_VALIDATION_KEYS = [
  "description",
  "doi",
  "entityTitle",
  "publicationString",
  "taskStatus",
  "validationStatus",
] as const;

export const SOURCE_DATASET_VALIDATIONS: ValidationDefinition<HCAAtlasTrackerDBSourceDataset>[] =
  [
    {
      description: "Ingest source dataset.",
      system: SYSTEM.CELLXGENE,
      validate(sourceDataset): boolean {
        return Boolean(sourceDataset.sd_info.cellxgeneCollectionId);
      },
      validationId: VALIDATION_ID.SOURCE_DATASET_IN_CELLXGENE,
      validationType: VALIDATION_TYPE.INGEST,
    },
    {
      description: "Ingest source dataset.",
      system: SYSTEM.HCA_DATA_REPOSITORY,
      validate(sourceDataset): boolean {
        return Boolean(sourceDataset.sd_info.hcaProjectId);
      },
      validationId: VALIDATION_ID.SOURCE_DATASET_IN_HCA_DATA_REPOSITORY,
      validationType: VALIDATION_TYPE.INGEST,
    },
    {
      description: "Update project title to match publication title.",
      system: SYSTEM.HCA_DATA_REPOSITORY,
      validate(sourceDataset): boolean | null {
        if (
          !sourceDataset.doi ||
          !sourceDataset.sd_info.publication ||
          !sourceDataset.sd_info.hcaProjectId
        ) {
          return null;
        }
        const hcaTitle = getProjectInfoByDoi(
          getPublicationDois(
            sourceDataset.doi,
            sourceDataset.sd_info.publication
          )
        )?.title;
        return sourceDataset.sd_info.publication.title === hcaTitle;
      },
      validationId:
        VALIDATION_ID.SOURCE_DATASET_TITLE_MATCHES_HCA_DATA_REPOSITORY,
      validationType: VALIDATION_TYPE.METADATA,
    },
  ];

function getValidationResult<T extends ENTITY_TYPE>(
  entityType: T,
  validation: ValidationDefinition<DBEntityOfType<T>>,
  entity: DBEntityOfType<T>,
  typeSpecificProperties: TypeSpecificValidationProperties
): HCAAtlasTrackerValidationResult | null {
  const isValid = validation.validate(entity);
  if (isValid === null) return null;
  const validationStatus = isValid
    ? VALIDATION_STATUS.PASSED
    : VALIDATION_STATUS.FAILED;
  return {
    description: validation.description,
    entityId: entity.id,
    entityType,
    system: validation.system,
    taskStatus:
      validationStatus === VALIDATION_STATUS.PASSED
        ? TASK_STATUS.DONE
        : TASK_STATUS.TODO,
    validationId: validation.validationId,
    validationStatus,
    validationType: validation.validationType,
    ...typeSpecificProperties,
  };
}

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

async function updateValidations(
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
    const newColumns: HCAAtlasTrackerDBValidationCreationColumns = {
      atlas_ids: result.atlasIds,
      entity_id: result.entityId,
      validation_id: result.validationId,
      validation_info: {
        description: result.description,
        doi: result.doi,
        entityTitle: result.entityTitle,
        entityType: result.entityType,
        publicationString: result.publicationString,
        system: result.system,
        taskStatus: result.taskStatus,
        validationStatus: result.validationStatus,
        validationType: result.validationType,
      },
    };
    const existingValidation = existingValidationsById.get(result.validationId);
    if (existingValidation) {
      // Update existing validation record if needed
      if (!shouldUpdateValidation(existingValidation, result)) continue;
      await client.query(
        "UPDATE hat.validations SET atlas_ids=$1, validation_info=$2 WHERE entity_id=$3 AND validation_id=$4",
        [
          newColumns.atlas_ids,
          JSON.stringify(newColumns.validation_info),
          entityId,
          result.validationId,
        ]
      );
    } else {
      // Insert new validation record if the record doesn't already exist
      await client.query(
        "INSERT INTO hat.validations (atlas_ids, entity_id, validation_id, validation_info) VALUES ($1, $2, $3, $4)",
        [
          newColumns.atlas_ids,
          newColumns.entity_id,
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

function shouldUpdateValidation(
  existingValidation: HCAAtlasTrackerDBValidation,
  validationResult: HCAAtlasTrackerValidationResult
): boolean {
  if (existingValidation.atlas_ids.length !== validationResult.atlasIds.length)
    return true;
  if (
    !validationResult.atlasIds.every((id) =>
      existingValidation.atlas_ids.includes(id)
    )
  ) {
    return true;
  }
  for (const key of CHANGE_INDICATING_VALIDATION_KEYS) {
    if (existingValidation.validation_info[key] !== validationResult[key])
      return true;
  }
  return false;
}

export async function getSourceDatasetValidationResults(
  sourceDataset: HCAAtlasTrackerDBSourceDataset,
  client: pg.PoolClient
): Promise<HCAAtlasTrackerValidationResult[]> {
  const validationResults: HCAAtlasTrackerValidationResult[] = [];
  const title = getSourceDatasetTitle(sourceDataset);
  const atlasProperties = await getSourceDatasetValidationAtlasProperties(
    sourceDataset,
    client
  );
  for (const validation of SOURCE_DATASET_VALIDATIONS) {
    const validationResult = getValidationResult(
      ENTITY_TYPE.SOURCE_DATASET,
      validation,
      sourceDataset,
      {
        doi: sourceDataset.doi,
        entityTitle: title,
        publicationString: getSourceDatasetCitation(
          dbSourceDatasetToApiSourceDataset(sourceDataset)
        ),
        ...atlasProperties,
      }
    );
    if (!validationResult) continue;
    validationResults.push(validationResult);
  }
  return validationResults;
}

function getSourceDatasetTitle(
  sourceDataset: HCAAtlasTrackerDBSourceDataset
): string {
  return (
    sourceDataset.sd_info.publication?.title ??
    sourceDataset.sd_info.unpublishedInfo?.title ??
    sourceDataset.id
  );
}

async function getSourceDatasetValidationAtlasProperties(
  sourceDataset: HCAAtlasTrackerDBSourceDataset,
  client: pg.PoolClient
): Promise<ValidationAtlasProperties> {
  const queryResult = await client.query<
    Pick<HCAAtlasTrackerDBAtlas, "id" | "overview">
  >("SELECT id, overview FROM hat.atlases WHERE source_datasets @> $1", [
    JSON.stringify(sourceDataset.id),
  ]);
  const properties: ValidationAtlasProperties = {
    atlasIds: [],
    atlasShortNames: [],
    networks: [],
    waves: [],
  };
  for (const {
    id,
    overview: { network, shortName, wave },
  } of queryResult.rows) {
    addArrayValueIfMissing(properties.atlasIds, id);
    addArrayValueIfMissing(properties.atlasShortNames, shortName);
    addArrayValueIfMissing(properties.networks, network);
    addArrayValueIfMissing(properties.waves, wave);
  }
  return properties;
}

function addArrayValueIfMissing<T>(array: T[], value: T): void {
  if (!array.includes(value)) array.push(value);
}
