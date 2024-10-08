import pg from "pg";
import { ValidationError } from "yup";
import {
  HCAAtlasTrackerDBComponentAtlas,
  HCAAtlasTrackerDBComponentAtlasInfo,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import {
  ComponentAtlasEditData,
  NewComponentAtlasData,
} from "../apis/catalog/hca-atlas-tracker/common/schema";
import { InvalidOperationError, NotFoundError } from "../utils/api-handler";
import { confirmAtlasExists } from "./atlases";
import { doTransaction, query } from "./database";
import {
  confirmSourceDatasetsExist,
  UpdatedSourceDatasetsInfo,
} from "./source-datasets";

interface ComponentAtlasDbEditData {
  componentInfoEdit: Pick<
    HCAAtlasTrackerDBComponentAtlasInfo,
    "description" | "cellxgeneDatasetId" | "cellxgeneDatasetVersion"
  >;
  title: HCAAtlasTrackerDBComponentAtlas["title"];
}

interface NewComponentAtlasDbData {
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
 * @param atlasId - ID of the associated atlas.
 * @param inputData - Values for the new component atlas.
 * @returns database model of new component atlas.
 */
export async function createComponentAtlas(
  atlasId: string,
  inputData: NewComponentAtlasData
): Promise<HCAAtlasTrackerDBComponentAtlas> {
  await confirmAtlasExists(atlasId);
  const { componentInfo, title } = await newComponentAtlasDataToDbData(
    inputData
  );
  const queryResult = await withTitleConflictHandling(
    async () =>
      await query<HCAAtlasTrackerDBComponentAtlas>(
        "INSERT INTO hat.component_atlases (atlas_id, component_info, title) VALUES ($1, $2, $3) RETURNING *",
        [atlasId, componentInfo, title]
      )
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
  const { componentInfoEdit, title } = await componentAtlasEditDataToDbData(
    inputData
  );
  const queryResult = await withTitleConflictHandling(
    async () =>
      await query<HCAAtlasTrackerDBComponentAtlas>(
        "UPDATE hat.component_atlases SET component_info=component_info||$1, title=$2 WHERE id=$3 AND atlas_id=$4 RETURNING *",
        [JSON.stringify(componentInfoEdit), title, componentAtlasId, atlasId]
      )
  );
  if (queryResult.rows.length === 0)
    throw getComponentAtlasNotFoundError(atlasId, componentAtlasId);
  return queryResult.rows[0];
}

/**
 * Derive new component atlas information from input values.
 * @param inputData - Values to derive component atlas from.
 * @returns database model of values needed to create a component atlas.
 */
async function newComponentAtlasDataToDbData(
  inputData: NewComponentAtlasData
): Promise<NewComponentAtlasDbData> {
  return {
    componentInfo: {
      assay: [],
      cellCount: 0,
      cellxgeneDatasetId: null,
      cellxgeneDatasetVersion: null,
      description: inputData.description ?? "",
      disease: [],
      suspensionType: [],
      tissue: [],
    },
    title: inputData.title,
  };
}

/**
 * Derive updated component atlas information from input values.
 * @param inputData - Values to derive component atlas from.
 * @returns database model of values needed to update a component atlas.
 */
async function componentAtlasEditDataToDbData(
  inputData: ComponentAtlasEditData
): Promise<ComponentAtlasDbEditData> {
  return {
    componentInfoEdit: {
      cellxgeneDatasetId: null,
      cellxgeneDatasetVersion: null,
      description: inputData.description ?? "",
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

  await doTransaction(async (client) => {
    await client.query(
      "UPDATE hat.component_atlases SET source_datasets=source_datasets||$1 WHERE id=$2",
      [sourceDatasetIds, componentAtlasId]
    );
    await updateComponentAtlasFieldsFromDatasets([componentAtlasId], client);
  });
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

  await doTransaction(async (client) => {
    await client.query(
      `
        UPDATE hat.component_atlases
        SET source_datasets = ARRAY(SELECT unnest(source_datasets) EXCEPT SELECT unnest($1::uuid[]))
        WHERE id=$2
      `,
      [sourceDatasetIds, componentAtlasId]
    );
    await updateComponentAtlasFieldsFromDatasets([componentAtlasId], client);
  });
}

/**
 * Update component atlases' aggregate fields and source dataset lists based on lists of created, modified, and deleted source datasets.
 * @param updatedDatasetsInfo - Object containing lists of IDs of source datasets to update component atlases of.
 * @param client - Postgres client to use.
 */
export async function updateComponentAtlasesForUpdatedSourceDatasets(
  updatedDatasetsInfo: UpdatedSourceDatasetsInfo,
  client: pg.PoolClient
): Promise<void> {
  const componentAtlasIds = await getComponentAtlasIdsHavingSourceDatasets(
    updatedDatasetsInfo.created.concat(
      updatedDatasetsInfo.modified,
      updatedDatasetsInfo.deleted
    ),
    client
  );
  await removeSourceDatasetsFromAllComponentAtlases(
    updatedDatasetsInfo.deleted,
    client,
    false
  );
  await updateComponentAtlasFieldsFromDatasets(componentAtlasIds, client);
}

/**
 * Remove the given source datasets from all component atlases that have any of them, and, unless otherwise specified, update the aggregated properties of those component atlases.
 * @param sourceDatasetIds - IDs of source datasets to remove.
 * @param client - Postgres client to use.
 * @param updateAggregateProperties - Whether to update the component atlas properties aggregated from source datasets (default true).
 */
export async function removeSourceDatasetsFromAllComponentAtlases(
  sourceDatasetIds: string[],
  client: pg.PoolClient,
  updateAggregateProperties = true
): Promise<void> {
  if (sourceDatasetIds.length === 0) return;
  const queryResult = await client.query<
    Pick<HCAAtlasTrackerDBComponentAtlas, "id">
  >(
    `
      UPDATE hat.component_atlases
      SET source_datasets = ARRAY(SELECT unnest(source_datasets) EXCEPT SELECT unnest($1::uuid[]))
      WHERE source_datasets && $1
      RETURNING id
    `,
    [sourceDatasetIds]
  );
  if (updateAggregateProperties) {
    const updatedComponentAtlasIds = queryResult.rows.map(({ id }) => id);
    await updateComponentAtlasFieldsFromDatasets(
      updatedComponentAtlasIds,
      client
    );
  }
}

/**
 * Update fields aggregated from source datasets on component atlases that have any of the specified source datasets.
 * @param sourceDatasetIds - IDs of source datasets to update the component atlases of.
 * @param client - Postgres client to use.
 */
export async function updateFieldsForComponentAtlasesHavingSourceDatasets(
  sourceDatasetIds: string[],
  client?: pg.PoolClient
): Promise<void> {
  await updateComponentAtlasFieldsFromDatasets(
    await getComponentAtlasIdsHavingSourceDatasets(sourceDatasetIds, client),
    client
  );
}

/**
 * Update fields aggregated from source datasets on the specified component atlases.
 * @param componentAtlasIds - IDs of the component atlases to update fields on.
 * @param client - Postgres client to use.
 */
export async function updateComponentAtlasFieldsFromDatasets(
  componentAtlasIds: string[],
  client?: pg.PoolClient
): Promise<void> {
  if (componentAtlasIds.length === 0) return;
  await query(
    `
      UPDATE hat.component_atlases c
      SET component_info = c.component_info || jsonb_build_object(
        'assay', cd.assay,
        'disease', cd.disease,
        'cellCount', cd.cell_count,
        'suspensionType', cd.suspension_type,
        'tissue', cd.tissue
      )
      FROM (
        SELECT
          csub.id AS id,
          coalesce(sum((d.sd_info->>'cellCount')::int), 0) AS cell_count,
          (SELECT coalesce(jsonb_agg(DISTINCT e), '[]'::jsonb) FROM unnest(array_agg(d.sd_info->'assay')) v(x), jsonb_array_elements(x) e) AS assay,
          (SELECT coalesce(jsonb_agg(DISTINCT e), '[]'::jsonb) FROM unnest(array_agg(d.sd_info->'disease')) v(x), jsonb_array_elements(x) e) AS disease,
          (SELECT coalesce(jsonb_agg(DISTINCT e), '[]'::jsonb) FROM unnest(array_agg(d.sd_info->'suspensionType')) v(x), jsonb_array_elements(x) e) AS suspension_type,
          (SELECT coalesce(jsonb_agg(DISTINCT e), '[]'::jsonb) FROM unnest(array_agg(d.sd_info->'tissue')) v(x), jsonb_array_elements(x) e) AS tissue
        FROM
          hat.component_atlases csub
          LEFT JOIN hat.source_datasets d
        ON d.id=ANY(csub.source_datasets)
        GROUP BY csub.id
      ) AS cd
      WHERE c.id=cd.id AND c.id=ANY($1)
    `,
    [componentAtlasIds],
    client
  );
}

/**
 * Get IDs of component atlases that have any of the specified source datasets.
 * @param sourceDatasetIds - IDs of source datasets to get component atlas IDs for.
 * @param client - Postgres client to use.
 * @returns component atlas IDs.
 */
export async function getComponentAtlasIdsHavingSourceDatasets(
  sourceDatasetIds: string[],
  client?: pg.PoolClient
): Promise<string[]> {
  if (sourceDatasetIds.length === 0) return [];
  return (
    await query<Pick<HCAAtlasTrackerDBComponentAtlas, "id">>(
      "SELECT id FROM hat.component_atlases WHERE source_datasets && $1",
      [sourceDatasetIds],
      client
    )
  ).rows.map(({ id }) => id);
}

/**
 * Call a function that sets a component atlas title in the database, and throw an appropriate error if a conflict occurs.
 * @param f - Function to call.
 * @returns result of calling the function.
 */
async function withTitleConflictHandling<T>(f: () => Promise<T>): Promise<T> {
  try {
    return await f();
  } catch (err) {
    if (
      err instanceof Error &&
      "constraint" in err &&
      err.constraint === "unique_component_atlases_title_atlas_id"
    ) {
      throw new ValidationError(
        "Title already exists in this atlas",
        undefined,
        "title"
      );
    }
    throw err;
  }
}

export function getComponentAtlasNotFoundError(
  atlasId: string,
  componentAtlasId: string
): NotFoundError {
  return new NotFoundError(
    `Component atlas with ID ${componentAtlasId} doesn't exist on atlas with ID ${atlasId}`
  );
}
