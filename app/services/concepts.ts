import pg from "pg";
import {
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBConcept,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import { NotFoundError } from "../utils/api-handler";
import {
  createConcept,
  getAtlasesMatchingConcept,
  getConcept,
  getConceptIdByInfo,
} from "../data/concepts";

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
 * Get the atlas with metadata matching the given concept.
 * @param conceptId - Concept ID.
 * @param client - Postgres client to use.
 * @returns matching atlas.
 */
export async function getAtlasMatchingConcept(
  conceptId: string,
  client: pg.PoolClient,
): Promise<HCAAtlasTrackerDBAtlas> {
  const atlases = await getAtlasesMatchingConcept(conceptId, client);

  if (atlases.length === 0) {
    const atlasInfo = await getConceptAtlasInfoString(conceptId, client);
    throw new NotFoundError(
      `No atlas found matching concept ${conceptId} (${atlasInfo})`,
    );
  }

  if (atlases.length > 1) {
    const atlasInfo = await getConceptAtlasInfoString(conceptId, client);
    throw new Error(
      `Multiple atlases found matching concept ${conceptId} (${atlasInfo})`,
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
