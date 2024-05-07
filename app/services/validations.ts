import pg from "pg";
import {
  DBEntityOfType,
  ENTITY_TYPE,
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBSourceDataset,
  HCAAtlasTrackerValidationResult,
  SYSTEM,
  TASK_STATUS,
  VALIDATION_ID,
  VALIDATION_STATUS,
  VALIDATION_TYPE,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import { getPublicationDois } from "../apis/catalog/hca-atlas-tracker/common/utils";
import { getProjectInfoByDoi } from "./hca-projects";

interface ValidationDefinition<T> {
  condition?: (entity: T) => boolean;
  description: string;
  system: SYSTEM;
  validate: (entity: T) => boolean;
  validationId: VALIDATION_ID;
  validationType: VALIDATION_TYPE;
}

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
      system: SYSTEM.CELLXGENE,
      validate(sourceDataset): boolean {
        return Boolean(sourceDataset.sd_info.hcaProjectId);
      },
      validationId: VALIDATION_ID.SOURCE_DATASET_IN_HCA_DATA_REPOSITORY,
      validationType: VALIDATION_TYPE.INGEST,
    },
    {
      condition(sourceDataset): boolean {
        return Boolean(sourceDataset.sd_info.publication);
      },
      description: "Update project title to match publication title.",
      system: SYSTEM.CELLXGENE,
      validate(sourceDataset): boolean {
        if (!sourceDataset.doi || !sourceDataset.sd_info.publication)
          return false;
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
      validationType: VALIDATION_TYPE.INGEST,
    },
  ];

function getValidationResult<T extends ENTITY_TYPE>(
  entityType: T,
  validation: ValidationDefinition<DBEntityOfType<T>>,
  entity: DBEntityOfType<T>,
  entityTitle: string,
  atlasIds: string[]
): HCAAtlasTrackerValidationResult {
  const validationStatus = validation.validate(entity)
    ? VALIDATION_STATUS.VALID
    : VALIDATION_STATUS.INVALID;
  return {
    atlasIds,
    description: validation.description,
    entityId: entity.id,
    entityTitle,
    entityType,
    system: validation.system,
    taskStatus:
      validationStatus === VALIDATION_STATUS.VALID
        ? TASK_STATUS.DONE
        : TASK_STATUS.TODO,
    validationId: validation.validationId,
    validationStatus,
    validationType: validation.validationType,
  };
}

export async function updateSourceDatasetValidations(
  sourceDataset: HCAAtlasTrackerDBSourceDataset,
  client: pg.PoolClient
): Promise<void> {
  const title = getSourceDatasetTitle(sourceDataset);
  const atlasIds = await getSourceDatasetAtlasIds(sourceDataset, client);
  for (const validation of SOURCE_DATASET_VALIDATIONS) {
    if (validation.condition && !validation.condition(sourceDataset)) continue;
    console.log(
      getValidationResult(
        ENTITY_TYPE.SOURCE_DATASET,
        validation,
        sourceDataset,
        title,
        atlasIds
      )
    );
  }
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

async function getSourceDatasetAtlasIds(
  sourceDataset: HCAAtlasTrackerDBSourceDataset,
  client: pg.PoolClient
): Promise<string[]> {
  const queryResult = await client.query<Pick<HCAAtlasTrackerDBAtlas, "id">>(
    "SELECT id FROM hat.atlases WHERE source_datasets @> $1",
    [JSON.stringify(sourceDataset.id)]
  );
  return queryResult.rows.map(({ id }) => id);
}
