import pg from "pg";
import {
  HCAAtlasTrackerDBComponentAtlas,
  HCAAtlasTrackerDBComponentAtlasFile,
  HCAAtlasTrackerDBComponentAtlasFileForDetailAPI,
  HCAAtlasTrackerDBComponentAtlasInfo,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import { confirmFileExistsOnAtlas } from "../data/files";
import { InvalidOperationError, NotFoundError } from "../utils/api-handler";
import { confirmAtlasExists } from "./atlases";
import { doOrContinueTransaction, doTransaction, query } from "./database";
import { confirmSourceDatasetsExist } from "./source-datasets";

/**
 * Get all component atlases of the given atlas.
 * @param atlasId - ID of the atlas to get component atlases for.
 * @param isArchivedValue - Value of `is_archived` to filter component atlases by. (Default false)
 * @returns component atlas files.
 */
export async function getAtlasComponentAtlases(
  atlasId: string,
  isArchivedValue = false
): Promise<HCAAtlasTrackerDBComponentAtlasFile[]> {
  await confirmAtlasExists(atlasId);
  const { rows } = await query<
    Omit<HCAAtlasTrackerDBComponentAtlasFile, "atlas_id">
  >(
    `
        SELECT
          f.id as file_id,
          f.dataset_info,
          f.id,
          f.integrity_status,
          f.key,
          f.size_bytes,
          f.validation_status,
          f.validation_summary
        FROM hat.files f
        JOIN hat.component_atlases ca ON f.component_atlas_id = ca.id
        WHERE f.is_latest AND f.is_archived = $2 AND f.file_type='integrated_object' AND ca.atlas_id=$1
      `,
    [atlasId, isArchivedValue]
  );
  return rows.map((row) => ({ atlas_id: atlasId, ...row }));
}

/**
 * Get a component atlas.
 * @param atlasId - ID of the atlas that the component atlas is accessed through.
 * @param fileId - ID of the component atlas's associated file.
 * @param isArchivedValue - Value of `is_archived` to filter component atlases by. (Default false)
 * @returns database model of the component atlas file.
 */
export async function getComponentAtlas(
  atlasId: string,
  fileId: string,
  isArchivedValue = false
): Promise<HCAAtlasTrackerDBComponentAtlasFileForDetailAPI> {
  const queryResult = await query<
    Omit<HCAAtlasTrackerDBComponentAtlasFileForDetailAPI, "atlas_id">
  >(
    `
      SELECT
        f.id as file_id,
        f.dataset_info,
        f.id,
        f.integrity_status,
        f.key,
        f.size_bytes,
        f.validation_status,
        f.validation_summary,
        f.validation_reports
      FROM hat.files f
      JOIN hat.component_atlases ca ON f.component_atlas_id = ca.id
      WHERE f.id=$1 AND f.is_archived=$3 AND ca.atlas_id=$2
    `,
    [fileId, atlasId, isArchivedValue]
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
  await confirmFileExistsOnAtlas(fileId, atlasId);

  const componentAtlasId = await getPresentComponentAtlasIdForFile(fileId);

  await confirmComponentAtlasIsAvailable(componentAtlasId);

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
  await confirmFileExistsOnAtlas(fileId, atlasId);

  const componentAtlasId = await getPresentComponentAtlasIdForFile(fileId);

  await confirmComponentAtlasIsAvailable(componentAtlasId);

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
 * Create a new component atlas.
 * @param atlasId - ID of the parent atlas.
 * @param title - Title of the component atlas.
 * @param client - Optional database client for transactions.
 * @returns the created component atlas.
 */
export async function createComponentAtlas(
  atlasId: string,
  title: string,
  client?: pg.PoolClient
): Promise<HCAAtlasTrackerDBComponentAtlas> {
  const info = getInitialComponentAtlasInfo();

  const result = await query<HCAAtlasTrackerDBComponentAtlas>(
    `
      INSERT INTO hat.component_atlases (atlas_id, title, component_info)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
    [atlasId, title, JSON.stringify(info)],
    client
  );

  return result.rows[0];
}

/**
 * Reset component atlas metadata (component_info).
 * @param componentAtlasId - ID of the component atlas to reset info for.
 * @param client - Optional database client to reuse an existing transaction.
 */
export async function resetComponentAtlasInfo(
  componentAtlasId: string,
  client?: pg.PoolClient
): Promise<void> {
  const info = getInitialComponentAtlasInfo();
  await doOrContinueTransaction(client, async (tx) => {
    const result = await tx.query(
      "UPDATE hat.component_atlases SET component_info = $2 WHERE id = $1",
      [componentAtlasId, JSON.stringify(info)]
    );
    if (!result.rowCount)
      throw new NotFoundError(
        `Component atlas with ID ${componentAtlasId} doesn't exist`
      );
  });
}

function getInitialComponentAtlasInfo(): HCAAtlasTrackerDBComponentAtlasInfo {
  return {
    assay: [],
    cellCount: 0,
    cellxgeneDatasetId: null,
    cellxgeneDatasetVersion: null,
    description: "",
    disease: [],
    suspensionType: [],
    tissue: [],
  };
}

export async function confirmComponentAtlasExistsOnAtlas(
  componentAtlasId: string,
  atlasId: string
): Promise<void> {
  const result = await query<Pick<HCAAtlasTrackerDBComponentAtlas, "atlas_id">>(
    "SELECT atlas_id FROM hat.component_atlases WHERE id=$1",
    [componentAtlasId]
  );
  if (result.rows[0]?.atlas_id !== atlasId)
    throw getComponentAtlasNotFoundError(atlasId, componentAtlasId);
}

/**
 * Throw an error if the specified component atlas is not available to users (e.g., is archived).
 * @param componentAtlasId - The ID of the component atlas to check.
 */
export async function confirmComponentAtlasIsAvailable(
  componentAtlasId: string
): Promise<void> {
  const queryResult = await query<Pick<HCAAtlasTrackerDBComponentAtlas, "id">>(
    `
        SELECT 1
        FROM hat.component_atlases c
        JOIN hat.files f ON f.component_atlas_id = c.id
        WHERE c.id = $1 AND f.is_latest AND NOT f.is_archived
      `,
    [componentAtlasId]
  );
  if (queryResult.rows.length === 0)
    throw new NotFoundError(
      `Component atlas with ID ${componentAtlasId} doesn't exist`
    );
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
