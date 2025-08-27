import pg from "pg";
import {
  HCAAtlasTrackerDBComponentAtlas,
  HCAAtlasTrackerDBComponentAtlasFile,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import { InvalidOperationError, NotFoundError } from "../utils/api-handler";
import { confirmAtlasExists } from "./atlases";
import { doTransaction, query } from "./database";
import { confirmFileExistsOnAtlas } from "./files";
import {
  confirmSourceDatasetsExist,
  UpdatedSourceDatasetsInfo,
} from "./source-datasets";

/**
 * Get all component atlases of the given atlas.
 * @param atlasId - ID of the atlas to get component atlases for.
 * @returns component atlas files.
 */
export async function getAtlasComponentAtlases(
  atlasId: string
): Promise<HCAAtlasTrackerDBComponentAtlasFile[]> {
  await confirmAtlasExists(atlasId);
  const { rows } = await query<
    Omit<HCAAtlasTrackerDBComponentAtlasFile, "atlas_id">
  >(
    `
        SELECT
          f.id,
          f.integrity_status,
          f.key,
          f.size_bytes,
          f.status
        FROM hat.files f
        JOIN hat.component_atlases ca ON f.component_atlas_id = ca.id
        WHERE f.file_type='integrated_object' AND ca.atlas_id=$1
      `,
    [atlasId]
  );
  return rows.map((row) => ({ atlas_id: atlasId, ...row }));
}

/**
 * Get a component atlas.
 * @param atlasId - ID of the atlas that the component atlas is accessed through.
 * @param fileId - ID of the component atlas's associated file.
 * @returns database model of the component atlas file.
 */
export async function getComponentAtlas(
  atlasId: string,
  fileId: string
): Promise<HCAAtlasTrackerDBComponentAtlasFile> {
  const queryResult = await query<
    Omit<HCAAtlasTrackerDBComponentAtlasFile, "atlas_id">
  >(
    `
      SELECT
        f.id,
        f.integrity_status,
        f.key,
        f.size_bytes,
        f.status
      FROM hat.files f
      JOIN hat.component_atlases ca ON f.component_atlas_id = ca.id
      WHERE f.id=$1 AND ca.atlas_id=$2
    `,
    [fileId, atlasId]
  );
  if (queryResult.rows.length === 0)
    throw getComponentAtlasFileNotFoundError(atlasId, fileId);
  return {
    atlas_id: atlasId,
    ...queryResult.rows[0],
  };
}

/**
 * Add the given source datasets to the specified comonent atlas.
 * @param atlasId - Atlas that the component atlas is accessed through.
 * @param fileId - Component atlas file ID.
 * @param sourceDatasetIds - IDs of source datasets to add.
 */
export async function addSourceDatasetsToComponentAtlas(
  atlasId: string,
  fileId: string,
  sourceDatasetIds: string[]
): Promise<void> {
  await confirmFileExistsOnAtlas(fileId, atlasId, "Component atlas file");

  const componentAtlasId = await getPresentComponentAtlasIdForFile(fileId);

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
 * @param fileId - Component atlas file ID.
 * @param sourceDatasetIds - IDs of source datasets to remove.
 */
export async function deleteSourceDatasetsFromComponentAtlas(
  atlasId: string,
  fileId: string,
  sourceDatasetIds: string[]
): Promise<void> {
  await confirmFileExistsOnAtlas(fileId, atlasId, "Component atlas file");

  const componentAtlasId = await getPresentComponentAtlasIdForFile(fileId);

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
 * Get the ID of the component atlas associated with the given file, throwing an error if there is none.
 * @param fileId - ID of the file to get the associated component atlas of.
 * @returns component atlas ID.
 */
export async function getPresentComponentAtlasIdForFile(
  fileId: string
): Promise<string> {
  const componentAtlasId = await getComponentAtlasIdForFile(fileId);
  if (componentAtlasId === null)
    throw new InvalidOperationError(
      `File with ID ${fileId} has no associated component atlas`
    );
  return componentAtlasId;
}

/**
 * Get the ID of the component atlas associated with the given file, or null if there is none.
 * @param fileId - ID of the file to get the associated component atlas of.
 * @returns component atlas ID or null.
 */
export async function getComponentAtlasIdForFile(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Placeholder until we actually link files to component atlases
  fileId: string
): Promise<string | null> {
  return null;
}

export function getComponentAtlasNotFoundError(
  atlasId: string,
  componentAtlasId: string
): NotFoundError {
  return new NotFoundError(
    `Component atlas with ID ${componentAtlasId} doesn't exist on atlas with ID ${atlasId}`
  );
}

export function getComponentAtlasFileNotFoundError(
  atlasId: string,
  fileId: string
): NotFoundError {
  return new NotFoundError(
    `Component atlas file with ID ${fileId} doesn't exist on atlas with ID ${atlasId}`
  );
}
