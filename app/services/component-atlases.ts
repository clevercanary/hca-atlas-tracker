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
import { getSourceDatasetVersionsForAtlas } from "../data/source-datasets";
import { InvalidOperationError, NotFoundError } from "../utils/api-handler";
import { doOrContinueTransaction, doTransaction, query } from "./database";

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
  isArchivedValue = false,
): Promise<HCAAtlasTrackerDBComponentAtlasForAPI[]> {
  const componentAtlasVersions =
    await getAtlasComponentAtlasVersionIds(atlasId);
  const { rows } = await query<HCAAtlasTrackerDBComponentAtlasForAPI>(
    `
        SELECT
          ca.*,
          (
            SELECT COUNT(d.id)::int
            FROM hat.source_datasets d
            JOIN hat.files f ON f.id = d.file_id
            WHERE d.version_id = ANY(ca.source_datasets) AND NOT f.is_archived
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
          con.base_filename
        FROM hat.component_atlases ca
        JOIN hat.files f ON f.id = ca.file_id
        JOIN hat.concepts con ON con.id = ca.id
        WHERE f.is_archived = $2 AND ca.version_id=ANY($1)
      `,
    [componentAtlasVersions, isArchivedValue],
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
  client?: pg.PoolClient,
): Promise<HCAAtlasTrackerDBComponentAtlasForDetailAPI> {
  const componentAtlasVersion = await getComponentAtlasVersionForAtlas(
    componentAtlasId,
    atlasId,
    client,
  );
  const queryResult = await query<HCAAtlasTrackerDBComponentAtlasForDetailAPI>(
    `
      SELECT
        ca.*,
        (
          SELECT COUNT(d.id)::int
          FROM hat.source_datasets d
          JOIN hat.files f ON f.id = d.file_id
          WHERE d.version_id = ANY(ca.source_datasets) AND NOT f.is_archived
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
        f.validation_reports,
        con.base_filename
      FROM hat.component_atlases ca
      JOIN hat.files f ON f.id = ca.file_id
      JOIN hat.concepts con ON con.id = ca.id
      WHERE ca.version_id=$1
    `,
    [componentAtlasVersion],
    client,
  );
  if (queryResult.rows.length === 0)
    throw getComponentAtlasNotFoundError(atlasId, componentAtlasId);
  return queryResult.rows[0];
}

/**
 * Get the version IDs of the component atlases of the given atlas.
 * @param atlasId - ID of the atlas to get component atlases of.
 * @returns component atlas IDs.
 */
export async function getAtlasComponentAtlasVersionIds(
  atlasId: string,
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
  inputData: ComponentAtlasEditData,
): Promise<HCAAtlasTrackerDBComponentAtlasForDetailAPI> {
  const componentAtlasVersion = await getComponentAtlasVersionForAtlas(
    componentAtlasId,
    atlasId,
  );
  await confirmComponentAtlasIsEditable(componentAtlasVersion);
  const updatedInfoFields: ComponentAtlasInfoUpdateFields = {
    capUrl: inputData.capUrl || null,
  };
  return await doTransaction(async (client) => {
    await query(
      "UPDATE hat.component_atlases SET component_info = component_info || $1 WHERE version_id = $2",
      [JSON.stringify(updatedInfoFields), componentAtlasVersion],
      client,
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
  sourceDatasetIds: string[],
): Promise<void> {
  const componentAtlasVersion = await getComponentAtlasVersionForAtlas(
    componentAtlasId,
    atlasId,
  );

  await confirmComponentAtlasIsEditable(componentAtlasVersion);

  const sourceDatasetVersions = await getSourceDatasetVersionsForAtlas(
    sourceDatasetIds,
    atlasId,
  );

  const existingDatasetsResult = await query<{ array: string[] }>(
    `
      SELECT ARRAY(
        SELECT sd_version FROM unnest(source_datasets) AS sd_version WHERE sd_version=ANY($1)
      ) FROM hat.component_atlases WHERE version_id=$2
    `,
    [sourceDatasetVersions, componentAtlasVersion],
  );

  if (existingDatasetsResult.rows.length === 0)
    throw getComponentAtlasNotFoundError(atlasId, componentAtlasId);

  const existingSpecifiedDatasets = existingDatasetsResult.rows[0].array;

  if (existingSpecifiedDatasets.length !== 0)
    throw new InvalidOperationError(
      `Component atlas with ID ${componentAtlasId} already has source datasets with version IDs: ${existingSpecifiedDatasets.join(
        ", ",
      )}`,
    );

  await query(
    "UPDATE hat.component_atlases SET source_datasets=source_datasets||$1 WHERE version_id=$2",
    [sourceDatasetVersions, componentAtlasVersion],
  );
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
  sourceDatasetIds: string[],
): Promise<void> {
  const componentAtlasVersion = await getComponentAtlasVersionForAtlas(
    componentAtlasId,
    atlasId,
  );

  await confirmComponentAtlasIsEditable(componentAtlasVersion);

  const sourceDatasetVersions = await getSourceDatasetVersionsForAtlas(
    sourceDatasetIds,
    atlasId,
  );

  const missingDatasetsResult = await query<{ array: string[] }>(
    `
      SELECT ARRAY(
        SELECT sd_version FROM unnest($1::uuid[]) AS sd_version WHERE NOT sd_version=ANY(source_datasets)
      ) FROM hat.component_atlases WHERE version_id=$2
    `,
    [sourceDatasetVersions, componentAtlasVersion],
  );

  if (missingDatasetsResult.rows.length === 0)
    throw getComponentAtlasNotFoundError(atlasId, componentAtlasId);

  const missingDatasets = missingDatasetsResult.rows[0].array;

  if (missingDatasets.length !== 0)
    throw new InvalidOperationError(
      `Component atlas with ID ${componentAtlasId} doesn't have source datasets with version IDs: ${missingDatasets.join(
        ", ",
      )}`,
    );

  await query(
    `
      UPDATE hat.component_atlases
      SET source_datasets = ARRAY(SELECT unnest(source_datasets) EXCEPT SELECT unnest($1::uuid[]))
      WHERE version_id=$2
    `,
    [sourceDatasetVersions, componentAtlasVersion],
  );
}

/**
 * Create a new component atlas.
 * @param atlasId - ID of the parent atlas.
 * @param fileId - Associated file ID for the new component atlas to reference.
 * @param conceptId - Associated concept ID for the new component atlas to reference.
 * @param client - Optional database client for transactions.
 * @returns the created component atlas.
 */
export async function createComponentAtlas(
  atlasId: string,
  fileId: string,
  conceptId: string,
  client?: pg.PoolClient,
): Promise<HCAAtlasTrackerDBComponentAtlas> {
  const info: HCAAtlasTrackerDBComponentAtlasInfo = {
    capUrl: null,
  };

  return doOrContinueTransaction(client, async (client) => {
    const result = await query<HCAAtlasTrackerDBComponentAtlas>(
      `
        INSERT INTO hat.component_atlases (component_info, file_id, id)
        VALUES ($1, $2, $3)
        RETURNING *
      `,
      [JSON.stringify(info), fileId, conceptId],
      client,
    );

    const componentAtlas = result.rows[0];

    const atlasResult = await query(
      "UPDATE hat.atlases SET component_atlases = component_atlases || $1::uuid WHERE id = $2",
      [componentAtlas.version_id, atlasId],
      client,
    );

    if (atlasResult.rowCount === 0)
      throw new NotFoundError(`Atlas with ID ${atlasId} doesn't exist`);

    return componentAtlas;
  });
}

/**
 * Get the ID of the version of the given component atlas that's linked to the given atlas.
 * @param componentAtlasId - ID of the component atlas to get the version ID of.
 * @param atlasId - ID of the atlas to get the linked component atlas of.
 * @param client - Postgres client to use.
 * @returns linked component atlas version ID.
 */
export async function getComponentAtlasVersionForAtlas(
  componentAtlasId: string,
  atlasId: string,
  client?: pg.PoolClient,
): Promise<string> {
  const queryResult = await query<
    Pick<HCAAtlasTrackerDBComponentAtlas, "version_id">
  >(
    `
      SELECT ca.version_id
      FROM hat.component_atlases ca
      JOIN hat.atlases a
      ON ca.version_id = ANY(a.component_atlases)
      WHERE ca.id = $1 AND a.id = $2
    `,
    [componentAtlasId, atlasId],
    client,
  );

  if (queryResult.rows.length === 0)
    throw getComponentAtlasNotFoundError(atlasId, componentAtlasId);

  if (queryResult.rows.length > 1)
    throw new Error(
      `Multiple versions of component atlas ${componentAtlasId} found linked to atlas ${atlasId}`,
    );

  return queryResult.rows[0].version_id;
}

/**
 * Throw an error if the specified component atlas is not editable by users (e.g., is archived or non-latest).
 * @param componentAtlasVersion - The version ID of the component atlas to check.
 */
async function confirmComponentAtlasIsEditable(
  componentAtlasVersion: string,
): Promise<void> {
  const queryResult = await query<
    Pick<HCAAtlasTrackerDBComponentAtlas, "is_latest"> &
      Pick<HCAAtlasTrackerDBFile, "is_archived">
  >(
    `
        SELECT c.is_latest, f.is_archived
        FROM hat.component_atlases c
        JOIN hat.files f ON f.id = c.file_id
        WHERE c.version_id = $1
      `,
    [componentAtlasVersion],
  );
  if (queryResult.rows.length === 0)
    throw new NotFoundError(
      `Component atlas with version ID ${componentAtlasVersion} doesn't exist`,
    );
  const { is_archived, is_latest } = queryResult.rows[0];
  if (is_archived)
    throw new InvalidOperationError(
      `Component atlas with version ID ${componentAtlasVersion} is archived and can't be edited`,
    );
  if (!is_latest) {
    throw new InvalidOperationError(
      `Component atlas with version ID ${componentAtlasVersion} is not the latest version of the component atlas and can't be edited`,
    );
  }
}

export function getComponentAtlasNotFoundError(
  atlasId: string,
  componentAtlasId: string,
): NotFoundError {
  return new NotFoundError(
    `Component atlas with ID ${componentAtlasId} doesn't exist on atlas with ID ${atlasId}`,
  );
}
