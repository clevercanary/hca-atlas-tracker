import { getCellxGeneCollections } from "app/utils/cellxgene-api";
import { normalizeDoi } from "../utils/doi";
import { makeRefreshService, RefreshInfo } from "./common/refresh-service";

interface CellxGeneData {
  collectionIdsByDoi: Map<string, string>;
  lastRefreshTime: number;
}

export type CellxGeneInfo = RefreshInfo<CellxGeneData>;

const REFRESH_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours

const { getData: getCellxGeneData } = makeRefreshService({
  getRefreshParams: () => undefined,
  async getRefreshedData() {
    const time = Date.now();
    return {
      collectionIdsByDoi: await getRefreshedCollectionIdsByDoi(),
      lastRefreshTime: time,
    };
  },
  getStoredInfo() {
    return globalThis.hcaAtlasTrackerCellxGeneInfoCache;
  },
  notReadyMessage: "DOI to CELLxGENE collection ID mapping not initialized",
  refreshNeeded(data) {
    if (!data) return true;
    return Date.now() - data.lastRefreshTime > REFRESH_INTERVAL;
  },
  setStoredInfo(info) {
    globalThis.hcaAtlasTrackerCellxGeneInfoCache = info;
  },
});

/**
 * Find the first of a list of DOIs that matches a CELLxGENE collection, and return the collection's ID, starting a refresh of the DOI-to-ID mappings if needed.
 * @param dois -- DOIs to check to find a collection ID.
 * @returns CELLxGENE collection ID, or null if none is found.
 */
export function getCellxGeneIdByDoi(dois: string[]): string | null {
  const { collectionIdsByDoi } = getCellxGeneData();
  for (const doi of dois) {
    const collectionId = collectionIdsByDoi.get(normalizeDoi(doi));
    if (collectionId !== undefined) return collectionId;
  }
  return null;
}

/**
 * Fetch CELLxGENE collections and build DOI-to-ID mapping.
 * @returns collection IDs by DOI.
 */
async function getRefreshedCollectionIdsByDoi(): Promise<Map<string, string>> {
  const idsByDoi = new Map<string, string>();
  for (const { collection_id, doi } of await getCellxGeneCollections()) {
    if (doi) idsByDoi.set(doi, collection_id);
  }
  return idsByDoi;
}
