import {
  type HCAAtlasTrackerComponentAtlasSourceDatasetsAdded,
  type HCAAtlasTrackerComponentAtlasSourceDatasetsChanges,
  type HCAAtlasTrackerComponentAtlasSourceDatasetsRemoved,
  type HCAAtlasTrackerDBAtlas,
  type HCAAtlasTrackerDBComponentAtlas,
  type HCAAtlasTrackerDBComponentAtlasForAPI,
  type HCAAtlasTrackerDBComponentAtlasForDetailAPI,
  type HCAAtlasTrackerDBComponentAtlasInfo,
  type HCAAtlasTrackerDBFile,
  type HCAAtlasTrackerDBSourceDataset,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type ComponentAtlasEditData } from "@/app/apis/catalog/hca-atlas-tracker/common/schema";
import {
  getAtlasSourceDatasetsAmongVersions,
  getSourceDatasetIdsAndVersionsForAtlas,
} from "@/app/data/source-datasets";
import { InvalidOperationError, NotFoundError } from "@/app/utils/api-errors";
import type pg from "pg";
import { updateDownloadNameIfChanged } from "./concepts";
import { doTransaction, query } from "./database";

type ComponentAtlasInfoUpdateFields = Pick<
  HCAAtlasTrackerDBComponentAtlasInfo,
  "capUrl"
>;

type SourceDatasetIdAndVersion = Pick<
  HCAAtlasTrackerDBSourceDataset,
  "id" | "version_id"
>;

interface SourceDatasetsChange {
  added: SourceDatasetIdAndVersion[];
  removed: SourceDatasetIdAndVersion[];
}

interface SourceDatasetsChangeParams {
  client: pg.PoolClient;
  linkedVersions: string[];
  linkedVersionSet: Set<string>;
  requestedDatasets: SourceDatasetIdAndVersion[];
}

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
          f.validation_info,
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
        f.validation_info,
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
    await updateDownloadNameIfChanged(
      componentAtlasId,
      inputData.downloadName,
      client,
    );
    await query(
      "UPDATE hat.component_atlases SET component_info = component_info || $1 WHERE version_id = $2",
      [JSON.stringify(updatedInfoFields), componentAtlasVersion],
      client,
    );
    return await getComponentAtlas(atlasId, componentAtlasId, client);
  });
}

/**
 * Add the given source datasets to the specified component atlas, skipping any that are already linked to it.
 * @param atlasId - Atlas that the component atlas is accessed through.
 * @param componentAtlasId - Component atlas ID.
 * @param sourceDatasetIds - IDs of source datasets to add.
 * @returns IDs of the source datasets that were newly linked.
 * @throws NotFoundError if the component atlas or any of the source datasets doesn't exist on the atlas.
 * @throws InvalidOperationError if the component atlas is archived or non-latest.
 */
export async function addSourceDatasetsToComponentAtlas(
  atlasId: string,
  componentAtlasId: string,
  sourceDatasetIds: string[],
): Promise<HCAAtlasTrackerComponentAtlasSourceDatasetsAdded> {
  const { added } = await changeComponentAtlasSourceDatasets(
    atlasId,
    componentAtlasId,
    sourceDatasetIds,
    async ({ linkedVersionSet, requestedDatasets }) => ({
      added: requestedDatasets.filter(
        ({ version_id }) => !linkedVersionSet.has(version_id),
      ),
      removed: [],
    }),
  );
  return { added };
}

/**
 * Remove the given source datasets from the specified component atlas, skipping any that aren't linked to it.
 * @param atlasId - Atlas that the component atlas is accessed through.
 * @param componentAtlasId - Component atlas ID.
 * @param sourceDatasetIds - IDs of source datasets to remove.
 * @returns IDs of the source datasets that were unlinked.
 * @throws NotFoundError if the component atlas or any of the source datasets doesn't exist on the atlas.
 * @throws InvalidOperationError if the component atlas is archived or non-latest.
 */
export async function deleteSourceDatasetsFromComponentAtlas(
  atlasId: string,
  componentAtlasId: string,
  sourceDatasetIds: string[],
): Promise<HCAAtlasTrackerComponentAtlasSourceDatasetsRemoved> {
  const { removed } = await changeComponentAtlasSourceDatasets(
    atlasId,
    componentAtlasId,
    sourceDatasetIds,
    async ({ linkedVersionSet, requestedDatasets }) => ({
      added: [],
      removed: requestedDatasets.filter(({ version_id }) =>
        linkedVersionSet.has(version_id),
      ),
    }),
  );
  return { removed };
}

/**
 * Replace the source datasets linked to the specified component atlas with the given ones, considering only source dataset versions that are linked to the atlas; linked versions that aren't on the atlas are left as-is.
 * @param atlasId - Atlas that the component atlas is accessed through.
 * @param componentAtlasId - Component atlas ID.
 * @param sourceDatasetIds - IDs of the source datasets that the component atlas should be linked to.
 * @returns IDs of the source datasets that were added and removed.
 * @throws NotFoundError if the component atlas or any of the source datasets doesn't exist on the atlas.
 * @throws InvalidOperationError if the component atlas is archived or non-latest.
 */
export async function setComponentAtlasSourceDatasets(
  atlasId: string,
  componentAtlasId: string,
  sourceDatasetIds: string[],
): Promise<HCAAtlasTrackerComponentAtlasSourceDatasetsChanges> {
  return await changeComponentAtlasSourceDatasets(
    atlasId,
    componentAtlasId,
    sourceDatasetIds,
    async ({ client, linkedVersions, linkedVersionSet, requestedDatasets }) => {
      const linkedAtlasDatasets = await getAtlasSourceDatasetsAmongVersions(
        linkedVersions,
        atlasId,
        client,
      );
      const requestedVersionSet = new Set(
        requestedDatasets.map(({ version_id }) => version_id),
      );
      return {
        added: requestedDatasets.filter(
          ({ version_id }) => !linkedVersionSet.has(version_id),
        ),
        removed: linkedAtlasDatasets.filter(
          ({ version_id }) => !requestedVersionSet.has(version_id),
        ),
      };
    },
  );
}

/**
 * Change the source datasets linked to the specified component atlas, in a transaction that holds a lock on the component atlas's row so that concurrent changes are serialized.
 * @param atlasId - Atlas that the component atlas is accessed through.
 * @param componentAtlasId - Component atlas ID.
 * @param sourceDatasetIds - IDs of the requested source datasets, passed to `getChanges` with their versions on the atlas.
 * @param getChanges - Function that, given the linked and requested source datasets, returns the source datasets to link and to unlink.
 * @returns IDs of the source datasets that were added and removed.
 * @throws NotFoundError if the component atlas or any of the source datasets doesn't exist on the atlas.
 * @throws InvalidOperationError if the component atlas is archived or non-latest.
 */
async function changeComponentAtlasSourceDatasets(
  atlasId: string,
  componentAtlasId: string,
  sourceDatasetIds: string[],
  getChanges: (
    params: SourceDatasetsChangeParams,
  ) => Promise<SourceDatasetsChange>,
): Promise<HCAAtlasTrackerComponentAtlasSourceDatasetsChanges> {
  return await doTransaction(async (client) => {
    const { componentAtlasVersion, linkedVersions } =
      await getLockedEditableComponentAtlasSourceDatasets(
        atlasId,
        componentAtlasId,
        client,
      );

    const requestedDatasets = await getSourceDatasetIdsAndVersionsForAtlas(
      sourceDatasetIds,
      atlasId,
      client,
    );

    const { added, removed } = await getChanges({
      client,
      linkedVersionSet: new Set(linkedVersions),
      linkedVersions,
      requestedDatasets,
    });

    if (added.length > 0 || removed.length > 0) {
      const removedVersionSet = new Set(
        removed.map(({ version_id }) => version_id),
      );
      const newVersions = linkedVersions
        .filter((version) => !removedVersionSet.has(version))
        .concat(added.map(({ version_id }) => version_id));
      await query(
        "UPDATE hat.component_atlases SET source_datasets=$1 WHERE version_id=$2",
        [newVersions, componentAtlasVersion],
        client,
      );
    }

    return {
      added: added.map(({ id }) => id),
      removed: removed.map(({ id }) => id),
    };
  });
}

/**
 * Create a new component atlas.
 * @param atlasId - ID of the parent atlas.
 * @param fileId - Associated file ID for the new component atlas to reference.
 * @param conceptId - Associated concept ID for the new component atlas to reference.
 * @param client - Database client for transaction.
 */
export async function createComponentAtlas(
  atlasId: string,
  fileId: string,
  conceptId: string,
  client: pg.PoolClient,
): Promise<void> {
  const info: HCAAtlasTrackerDBComponentAtlasInfo = {
    capUrl: null,
  };

  const result = await client.query<
    Pick<HCAAtlasTrackerDBComponentAtlas, "version_id">
  >(
    `
      INSERT INTO hat.component_atlases (component_info, file_id, id)
      VALUES ($1, $2, $3)
      RETURNING version_id
    `,
    [JSON.stringify(info), fileId, conceptId],
  );

  const componentAtlasVersion = result.rows[0].version_id;

  const atlasResult = await client.query(
    "UPDATE hat.atlases SET component_atlases = component_atlases || $1::uuid WHERE id = $2",
    [componentAtlasVersion, atlasId],
  );

  if (atlasResult.rowCount === 0)
    throw new NotFoundError(`Atlas with ID ${atlasId} doesn't exist`);
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
 * Get the version of the given component atlas that's linked to the given atlas, along with its linked source dataset versions, locking its row for the rest of the transaction so that concurrent source dataset edits are serialized.
 * @param atlasId - ID of the atlas that the component atlas is accessed through.
 * @param componentAtlasId - ID of the component atlas.
 * @param client - Postgres client of the transaction to hold the lock for.
 * @returns component atlas version ID and linked source dataset version IDs.
 * @throws NotFoundError if the component atlas doesn't exist on the atlas.
 * @throws InvalidOperationError if the component atlas is archived or non-latest.
 */
async function getLockedEditableComponentAtlasSourceDatasets(
  atlasId: string,
  componentAtlasId: string,
  client: pg.PoolClient,
): Promise<{ componentAtlasVersion: string; linkedVersions: string[] }> {
  const componentAtlasVersion = await getComponentAtlasVersionForAtlas(
    componentAtlasId,
    atlasId,
    client,
  );

  const lockResult = await query<
    Pick<HCAAtlasTrackerDBComponentAtlas, "source_datasets">
  >(
    "SELECT source_datasets FROM hat.component_atlases WHERE version_id=$1 FOR UPDATE",
    [componentAtlasVersion],
    client,
  );

  if (lockResult.rows.length === 0)
    throw getComponentAtlasNotFoundError(atlasId, componentAtlasId);

  await confirmComponentAtlasIsEditable(componentAtlasVersion, client);

  return {
    componentAtlasVersion,
    linkedVersions: lockResult.rows[0].source_datasets,
  };
}

/**
 * Throw an error if the specified component atlas is not editable by users (e.g., is archived or non-latest).
 * @param componentAtlasVersion - The version ID of the component atlas to check.
 * @param client - Postgres client to use.
 */
async function confirmComponentAtlasIsEditable(
  componentAtlasVersion: string,
  client?: pg.PoolClient,
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
    client,
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
