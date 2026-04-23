import { getFileExtension } from "app/utils/files";
import pg from "pg";
import { ValidationError } from "yup";
import {
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBConcept,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import {
  createConcept,
  getAtlasesMatchingConceptAndRevision,
  getConcept,
  getConceptIdByInfo,
  setConceptBaseFilename,
} from "../data/concepts";
import { NotFoundError } from "../utils/api-handler";
import { mapDatabaseError } from "./database";

/**
 * Get an existing concept ID if it exists, or create a new concept otherwise.
 * @param info - Values with which to look up or create a concept.
 * @param info.atlas_short_name - Lowercase atlas short name.
 * @param info.base_filename - File name.
 * @param info.file_type - File type.
 * @param info.generation - Atlas generation.
 * @param info.network - Atlas network.
 * @param client - Postgres client to use.
 * @returns concept ID.
 */
export async function getOrCreateConceptId(
  info: Pick<
    HCAAtlasTrackerDBConcept,
    | "atlas_short_name"
    | "base_filename"
    | "file_type"
    | "generation"
    | "network"
  >,
  client: pg.PoolClient,
): Promise<string> {
  const existingId = await getConceptIdByInfo(info, client);
  if (existingId !== null) return existingId;
  return await createConcept(info, client);
}

/**
 * Get a specified revision of the atlas with metadata matching the given concept.
 * @param conceptId - Concept ID.
 * @param revision - Atlas revision to get.
 * @param client - Postgres client to use.
 * @returns matching atlas.
 */
export async function getAtlasMatchingConceptAndRevision(
  conceptId: string,
  revision: number,
  client: pg.PoolClient,
): Promise<HCAAtlasTrackerDBAtlas> {
  const atlases = await getAtlasesMatchingConceptAndRevision(
    conceptId,
    revision,
    client,
  );

  if (atlases.length === 0) {
    const atlasInfo = await getConceptAtlasInfoString(conceptId, client);
    throw new NotFoundError(
      `No atlas of revision ${revision} found matching concept ${conceptId} (${atlasInfo})`,
    );
  }

  if (atlases.length > 1) {
    const atlasInfo = await getConceptAtlasInfoString(conceptId, client);
    const atlasIds = atlases.map((a) => a.id);
    throw new Error(
      `Multiple atlases of revision ${revision} found matching concept ${conceptId} (${atlasInfo}): ${atlasIds.join(", ")}`,
    );
  }

  return atlases[0];
}

async function getConceptAtlasInfoString(
  conceptId: string,
  client: pg.PoolClient,
): Promise<string> {
  const concept = await getConcept(conceptId, client);
  return `${concept.atlas_short_name} v${concept.generation} in ${concept.network} network`;
}

/**
 * Update a concept's base filename based on a specified download name.
 * @param conceptId - ID of the concept to update.
 * @param newDownloadName - New download name to derive a new base filename from.
 * @param client - Postgres client to use.
 */
export async function updateDownloadNameIfChanged(
  conceptId: string,
  newDownloadName: string,
  client: pg.PoolClient,
): Promise<void> {
  const { base_filename: existingBaseFilename } = await getConcept(
    conceptId,
    client,
  );
  const newBaseFilename =
    newDownloadName + getFileExtension(existingBaseFilename);

  if (newBaseFilename === existingBaseFilename) return;

  await mapDatabaseError(
    () => setConceptBaseFilename(conceptId, newBaseFilename, client),
    () =>
      new ValidationError(
        `A file with download name ${JSON.stringify(newDownloadName)} already exists for this atlas generation`,
        undefined,
        "downloadName",
      ),
    { constraint: "idx_concepts_identity_fields" },
  );
}
