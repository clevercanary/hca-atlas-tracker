import { InvalidOperationError, NotFoundError } from "app/utils/api-handler";
import {
  HCAAtlasTrackerDBComponentAtlas,
  HCAAtlasTrackerDBComponentAtlasInfo,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import {
  ComponentAtlasEditData,
  NewComponentAtlasData,
} from "../apis/catalog/hca-atlas-tracker/common/schema";
import { confirmAtlasExists } from "./atlases";
import { query } from "./database";
import { confirmSourceDatasetsExist } from "./source-datasets";

interface ComponentAtlasInputDbData {
  componentInfo: HCAAtlasTrackerDBComponentAtlasInfo;
  title: HCAAtlasTrackerDBComponentAtlas["title"];
}

/**
 * Get all component atlases of the given atlas.
 * @param atlasId - ID of the atlas to get component atlases for.
 * @returns component atlases.
 */
export async function getAtlasComponentAtlases(
  atlasId: string
): Promise<HCAAtlasTrackerDBComponentAtlas[]> {
  await confirmAtlasExists(atlasId);
  return (
    await query<HCAAtlasTrackerDBComponentAtlas>(
      "SELECT * FROM hat.component_atlases WHERE atlas_id=$1",
      [atlasId]
    )
  ).rows;
}

/**
 * Get a component atlas.
 * @param atlasId - ID of the atlas that the component atlas is accessed through.
 * @param componentAtlasId - ID of the component atlas to get.
 * @returns database model of the component atlas.
 */
export async function getComponentAtlas(
  atlasId: string,
  componentAtlasId: string
): Promise<HCAAtlasTrackerDBComponentAtlas> {
  const queryResult = await query<HCAAtlasTrackerDBComponentAtlas>(
    "SELECT * FROM hat.component_atlases WHERE id=$1 AND atlas_id=$2",
    [componentAtlasId, atlasId]
  );
  if (queryResult.rows.length === 0)
    throw getComponentAtlasNotFoundError(atlasId, componentAtlasId);
  return queryResult.rows[0];
}

/**
 * Create a new component atlas.
 * @param atlasId - ID of the the associated atlas.
 * @param inputData - Values for the new component atlas.
 * @returns database model of new component atlas.
 */
export async function createComponentAtlas(
  atlasId: string,
  inputData: NewComponentAtlasData
): Promise<HCAAtlasTrackerDBComponentAtlas> {
  await confirmAtlasExists(atlasId);
  const { componentInfo, title } = await componentAtlasInputDataToDbData(
    inputData
  );
  const queryResult = await query<HCAAtlasTrackerDBComponentAtlas>(
    "INSERT INTO hat.component_atlases (atlas_id, component_info, title) VALUES ($1, $2, $3) RETURNING *",
    [atlasId, componentInfo, title]
  );
  return queryResult.rows[0];
}

/**
 * Update a component atlas.
 * @param atlasId - ID of the atlas that the component atlas is accessed through.
 * @param componentAtlasId - ID of the component atlas to update.
 * @param inputData - Values to update the component atlas with.
 * @returns database model of the updated component atlas.
 */
export async function updateComponentAtlas(
  atlasId: string,
  componentAtlasId: string,
  inputData: ComponentAtlasEditData
): Promise<HCAAtlasTrackerDBComponentAtlas> {
  const { componentInfo, title } = await componentAtlasInputDataToDbData(
    inputData
  );
  const queryResult = await query<HCAAtlasTrackerDBComponentAtlas>(
    "UPDATE hat.component_atlases SET component_info=$1, title=$2 WHERE id=$3 AND atlas_id=$4 RETURNING *",
    [JSON.stringify(componentInfo), title, componentAtlasId, atlasId]
  );
  if (queryResult.rows.length === 0)
    throw getComponentAtlasNotFoundError(atlasId, componentAtlasId);
  return queryResult.rows[0];
}

/**
 * Derive component atlas information from input values.
 * @param inputData - Values to derive component atlas from.
 * @returns database model of values needed to define a component atlas.
 */
async function componentAtlasInputDataToDbData(
  inputData: NewComponentAtlasData | ComponentAtlasEditData
): Promise<ComponentAtlasInputDbData> {
  return {
    componentInfo: {
      cellxgeneDatasetId: null,
      cellxgeneDatasetVersion: null,
    },
    title: inputData.title,
  };
}

/**
 * Delete a component atlas.
 * @param atlasId - ID of the atlas that the component atlas is accessed through.
 * @param componentAtlasId - ID of the component atlas to delete.
 */
export async function deleteComponentAtlas(
  atlasId: string,
  componentAtlasId: string
): Promise<void> {
  const queryResult = await query<HCAAtlasTrackerDBComponentAtlas>(
    "DELETE FROM hat.component_atlases WHERE id=$1 AND atlas_id=$2",
    [componentAtlasId, atlasId]
  );
  if (queryResult.rowCount === 0)
    throw getComponentAtlasNotFoundError(atlasId, componentAtlasId);
}

/**
 * Add the given source datasets to the specified comonent atlas.
 * @param atlasId - Atlas that the component atlas is accessed through.
 * @param componentAtlasId - Component atlas ID.
 * @param sourceDatasetIds - IDs of source datasets to add.
 */
export async function addSourceDatasetsToComponentAtlas(
  atlasId: string,
  componentAtlasId: string,
  sourceDatasetIds: string[]
): Promise<void> {
  await confirmSourceDatasetsExist(sourceDatasetIds);

  const existingDatasetsResult = await query<{ array: string[] }>(
    `
      SELECT ARRAY(
        SELECT sd_id FROM unnest(source_datasets) AS sd_id WHERE sd_id=ANY($1)
      ) FROM hat.component_atlases WHERE id=$2 AND atlas_id=$3
    `,
    [sourceDatasetIds, componentAtlasId, atlasId]
  );

  if (existingDatasetsResult.rows.length === 0)
    throw getComponentAtlasNotFoundError(atlasId, componentAtlasId);

  const existingSpecifiedDatasets = existingDatasetsResult.rows[0].array;

  if (existingSpecifiedDatasets.length !== 0)
    throw new InvalidOperationError(
      `Component atlas with ID ${componentAtlasId} already has source datasets with IDs: ${existingSpecifiedDatasets.join(
        ", "
      )}`
    );

  await query(
    "UPDATE hat.component_atlases SET source_datasets=source_datasets||$1 WHERE id=$2",
    [sourceDatasetIds, componentAtlasId]
  );
}

/**
 * Remove the given source datasets from the specified comonent atlas.
 * @param atlasId - Atlas that the component atlas is accessed through.
 * @param componentAtlasId - Component atlas ID.
 * @param sourceDatasetIds - IDs of source datasets to remove.
 */
export async function deleteSourceDatasetsFromComponentAtlas(
  atlasId: string,
  componentAtlasId: string,
  sourceDatasetIds: string[]
): Promise<void> {
  await confirmSourceDatasetsExist(sourceDatasetIds);

  const missingDatasetsResult = await query<{ array: string[] }>(
    `
      SELECT ARRAY(
        SELECT sd_id FROM unnest($1::uuid[]) AS sd_id WHERE NOT sd_id=ANY(source_datasets)
      ) FROM hat.component_atlases WHERE id=$2 AND atlas_id=$3
    `,
    [sourceDatasetIds, componentAtlasId, atlasId]
  );

  if (missingDatasetsResult.rows.length === 0)
    throw getComponentAtlasNotFoundError(atlasId, componentAtlasId);

  const missingDatasets = missingDatasetsResult.rows[0].array;

  if (missingDatasets.length !== 0)
    throw new InvalidOperationError(
      `Component atlas with ID ${componentAtlasId} doesn't have source datasets with IDs: ${missingDatasets.join(
        ", "
      )}`
    );

  await query(
    `
      UPDATE hat.component_atlases
      SET source_datasets = ARRAY(SELECT unnest(source_datasets) EXCEPT SELECT unnest($1::uuid[]))
      WHERE id=$2
    `,
    [sourceDatasetIds, componentAtlasId]
  );
}

export function getComponentAtlasNotFoundError(
  atlasId: string,
  componentAtlasId: string
): NotFoundError {
  return new NotFoundError(
    `Component atlas with ID ${componentAtlasId} doesn't exist on atlas with ID ${atlasId}`
  );
}
