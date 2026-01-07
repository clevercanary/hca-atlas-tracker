import pg from "pg";
import {
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBComponentAtlas,
  HCAAtlasTrackerDBComponentAtlasForAPI,
  HCAAtlasTrackerDBComponentAtlasForDetailAPI,
  HCAAtlasTrackerDBComponentAtlasInfo,
  HCAAtlasTrackerDBFile,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import { ComponentAtlasEditData } from "../apis/catalog/hca-atlas-tracker/common/schema";
import { InvalidOperationError, NotFoundError } from "../utils/api-handler";
import { doOrContinueTransaction, doTransaction, query } from "./database";
import { confirmSourceDatasetsExist } from "./source-datasets";

type ComponentAtlasInfoUpdateFields = Pick<
  HCAAtlasTrackerDBComponentAtlasInfo,
  "capUrl"
>;

/**
 * Get all component atlases of the given atlas.
 * @param atlasId - ID of the atlas to get component atlases for.
 * @param isArchivedValue - Value of `is_archived` to filter component atlases by. (Default false)
 * @returns component atlas files.
 */
export async function getAtlasComponentAtlases(
  atlasId: string,
  isArchivedValue = false
): Promise<HCAAtlasTrackerDBComponentAtlasForAPI[]> {
  const componentAtlasIds = await getAtlasComponentAtlasIds(atlasId);
  const { rows } = await query<HCAAtlasTrackerDBComponentAtlasForAPI>(
    `
        SELECT
          ca.*,
          (
            SELECT COUNT(d.id)::int
            FROM hat.source_datasets d
            JOIN hat.files f ON f.id = d.file_id
            WHERE d.id = ANY(ca.source_datasets) AND f.is_latest AND NOT f.is_archived
          ) AS source_dataset_count,
          f.event_info,
          f.id as file_id,
          f.dataset_info,
          f.integrity_status,
          f.is_archived,
          f.key,
          f.size_bytes,
          f.validation_status,
          f.validation_summary
        FROM hat.component_atlases ca
        JOIN hat.files f ON f.id = ca.file_id
        WHERE f.is_latest AND f.is_archived = $2 AND ca.id=ANY($1)
      `,
    [componentAtlasIds, isArchivedValue]
  );
  return rows;
}

/**
 * Get a component atlas.
 * @param atlasId - ID of the atlas that the component atlas is accessed through.
 * @param componentAtlasId - ID of the component atlas.
 * @param client - Postgres client to use.
 * @returns database model of the component atlas file.
 */
export async function getComponentAtlas(
  atlasId: string,
  componentAtlasId: string,
  client?: pg.PoolClient
): Promise<HCAAtlasTrackerDBComponentAtlasForDetailAPI> {
  await confirmComponentAtlasExistsOnAtlas(componentAtlasId, atlasId);
  const queryResult = await query<HCAAtlasTrackerDBComponentAtlasForDetailAPI>(
    `
      SELECT
        ca.*,
        (
          SELECT COUNT(d.id)::int
          FROM hat.source_datasets d
          JOIN hat.files f ON f.id = d.file_id
          WHERE d.id = ANY(ca.source_datasets) AND f.is_latest AND NOT f.is_archived
        ) AS source_dataset_count,
        f.event_info,
        f.id as file_id,
        f.dataset_info,
        f.integrity_status,
        f.is_archived,
        f.key,
        f.size_bytes,
        f.validation_status,
        f.validation_summary,
        f.validation_reports
      FROM hat.component_atlases ca
      JOIN hat.files f ON f.id = ca.file_id
      WHERE f.is_latest AND ca.id=$1
    `,
    [componentAtlasId],
    client
  );
  if (queryResult.rows.length === 0)
    throw getComponentAtlasNotFoundError(atlasId, componentAtlasId);
  return queryResult.rows[0];
}

/**
 * Get the IDs of the component atlases of the given atlas.
 * @param atlasId - ID of the atlas to get component atleses of.
 * @returns component atlas IDs.
 */
export async function getAtlasComponentAtlasIds(
  atlasId: string
): Promise<string[]> {
  const queryResult = await query<
    Pick<HCAAtlasTrackerDBAtlas, "component_atlases">
  >("SELECT component_atlases FROM hat.atlases WHERE id=$1", [atlasId]);
  if (queryResult.rows.length === 0)
    throw new NotFoundError(`Atlas with ID ${atlasId} doesn't exist`);
  return queryResult.rows[0].component_atlases;
}

/**
 * Update a component atlas of an atlas.
 * @param atlasId - ID of the atlas that the component atlas is accessed through.
 * @param componentAtlasId - ID of the component atlas to update.
 * @param inputData - Data with which to update the component atlas.
 * @returns updated component atlas.
 */
export async function updateComponentAtlas(
  atlasId: string,
  componentAtlasId: string,
  inputData: ComponentAtlasEditData
): Promise<HCAAtlasTrackerDBComponentAtlasForDetailAPI> {
  await confirmComponentAtlasExistsOnAtlas(componentAtlasId, atlasId);
  await confirmComponentAtlasIsAvailable(componentAtlasId);
  const updatedInfoFields: ComponentAtlasInfoUpdateFields = {
    capUrl: inputData.capUrl || null,
  };
  return await doTransaction(async (client) => {
    await query(
      "UPDATE hat.component_atlases SET component_info = component_info || $1 WHERE id = $2",
      [JSON.stringify(updatedInfoFields), componentAtlasId],
      client
    );
    return await getComponentAtlas(atlasId, componentAtlasId, client);
  });
}

/**
 * Add the given source datasets to the specified component atlas.
 * @param atlasId - Atlas that the component atlas is accessed through.
 * @param componentAtlasId - Component atlas ID.
 * @param sourceDatasetIds - IDs of source datasets to add.
 */
export async function addSourceDatasetsToComponentAtlas(
  atlasId: string,
  componentAtlasId: string,
  sourceDatasetIds: string[]
): Promise<void> {
  await confirmComponentAtlasIsAvailable(componentAtlasId);

  await confirmSourceDatasetsExist(sourceDatasetIds);

  await confirmComponentAtlasExistsOnAtlas(componentAtlasId, atlasId);

  const existingDatasetsResult = await query<{ array: string[] }>(
    `
      SELECT ARRAY(
        SELECT sd_id FROM unnest(source_datasets) AS sd_id WHERE sd_id=ANY($1)
      ) FROM hat.component_atlases WHERE id=$2
    `,
    [sourceDatasetIds, componentAtlasId]
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
  });
}

/**
 * Remove the given source datasets from the specified component atlas.
 * @param atlasId - Atlas that the component atlas is accessed through.
 * @param componentAtlasId - Component atlas ID.
 * @param sourceDatasetIds - IDs of source datasets to remove.
 */
export async function deleteSourceDatasetsFromComponentAtlas(
  atlasId: string,
  componentAtlasId: string,
  sourceDatasetIds: string[]
): Promise<void> {
  await confirmComponentAtlasExistsOnAtlas(componentAtlasId, atlasId);

  await confirmComponentAtlasIsAvailable(componentAtlasId);

  await confirmSourceDatasetsExist(sourceDatasetIds);

  const missingDatasetsResult = await query<{ array: string[] }>(
    `
      SELECT ARRAY(
        SELECT sd_id FROM unnest($1::uuid[]) AS sd_id WHERE NOT sd_id=ANY(source_datasets)
      ) FROM hat.component_atlases WHERE id=$2
    `,
    [sourceDatasetIds, componentAtlasId]
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
  });
}

/**
 * Create a new component atlas.
 * @param atlasId - ID of the parent atlas.
 * @param fileId - Associated file ID for the new component atlas to reference.
 * @param client - Optional database client for transactions.
 * @returns the created component atlas.
 */
export async function createComponentAtlas(
  atlasId: string,
  fileId: string,
  client?: pg.PoolClient
): Promise<HCAAtlasTrackerDBComponentAtlas> {
  const info: HCAAtlasTrackerDBComponentAtlasInfo = {
    capUrl: null,
  };

  return doOrContinueTransaction(client, async (client) => {
    const result = await query<HCAAtlasTrackerDBComponentAtlas>(
      `
        INSERT INTO hat.component_atlases (component_info, file_id)
        VALUES ($1, $2)
        RETURNING *
      `,
      [JSON.stringify(info), fileId],
      client
    );

    const componentAtlas = result.rows[0];

    const atlasResult = await query(
      "UPDATE hat.atlases SET component_atlases = component_atlases || $1::uuid WHERE id = $2",
      [componentAtlas.id, atlasId],
      client
    );

    if (atlasResult.rowCount === 0)
      throw new NotFoundError(`Atlas with ID ${atlasId} doesn't exist`);

    return componentAtlas;
  });
}

export async function confirmComponentAtlasExistsOnAtlas(
  componentAtlasId: string,
  atlasId: string
): Promise<void> {
  const result = await query(
    "SELECT 1 FROM hat.atlases WHERE id=$1 AND $2=ANY(component_atlases)",
    [atlasId, componentAtlasId]
  );
  if (result.rows.length === 0)
    throw getComponentAtlasNotFoundError(atlasId, componentAtlasId);
}

/**
 * Throw an error if the specified component atlas is not available to users (e.g., is archived).
 * @param componentAtlasId - The ID of the component atlas to check.
 */
export async function confirmComponentAtlasIsAvailable(
  componentAtlasId: string
): Promise<void> {
  const queryResult = await query<Pick<HCAAtlasTrackerDBFile, "is_archived">>(
    `
        SELECT f.is_archived
        FROM hat.component_atlases c
        JOIN hat.files f ON f.id = c.file_id
        WHERE c.id = $1 AND f.is_latest
      `,
    [componentAtlasId]
  );
  if (queryResult.rows.length === 0)
    throw new NotFoundError(
      `Component atlas with ID ${componentAtlasId} doesn't exist`
    );
  if (queryResult.rows[0].is_archived)
    throw new InvalidOperationError(
      `Component atlas with ID ${componentAtlasId} is archived`
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
