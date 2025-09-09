import { Options as KyOptions } from "ky";
import { getCellxGeneCollections } from "../utils/cellxgene-api";
import { normalizeDoi } from "../utils/doi";
import { makeRefreshService, RefreshInfo } from "./common/refresh-service";
import { doUpdatesIfRefreshesComplete } from "./refresh-services";

export interface CollectionInfo {
  id: string;
  title: string;
}

interface CellxGeneData {
  collectionInfoByDoi: Map<string, CollectionInfo>;
  collectionInfoById: Map<string, CollectionInfo>;
  lastRefreshTime: number;
}

export type CellxGeneInfo = RefreshInfo<CellxGeneData>;

const REFRESH_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours

const KY_OPTIONS: KyOptions = {
  retry: {
    delay: () => 60000,
    limit: 5,
  },
  timeout: 120000,
};

const refreshService = makeRefreshService({
  autoStart: process.env.NODE_ENV !== "test",
  getRefreshParams: () => undefined,
  async getRefreshedData() {
    const time = Date.now();
    const collectionMaps = await getRefreshedCollectionMaps();
    return {
      ...collectionMaps,
      lastRefreshTime: time,
    };
  },
  getStoredInfo() {
    return globalThis.hcaAtlasTrackerCellxGeneInfoCache;
  },
  notReadyMessage: "Cache of CELLxGENE collections not initialized",
  onRefreshSuccess() {
    doUpdatesIfRefreshesComplete();
  },
  refreshNeeded(data) {
    if (!data) return true;
    return Date.now() - data.lastRefreshTime > REFRESH_INTERVAL;
  },
  setStoredInfo(info) {
    globalThis.hcaAtlasTrackerCellxGeneInfoCache = info;
  },
});

export const forceCellxGeneRefresh = refreshService.forceRefresh;

export const getCellxGeneStatus = refreshService.getStatus;

export const isCellxGeneRefreshing = refreshService.isRefreshing;

/**
 * Find the first of a list of DOIs that matches a CELLxGENE collection, and return the collection's ID, starting a refresh of the DOI-to-collection mappings if needed.
 * @param dois -- Normalized DOIs to check to find a collection.
 * @returns CELLxGENE collection ID, or null if none is found.
 */
export function getCellxGeneIdByDoi(dois: string[]): string | null {
  return getCellxGeneInfoByDoi(dois)?.id ?? null;
}

/**
 * Find the first of a list of DOIs that matches a CELLxGENE collection, and return the collection's info, starting a refresh of the DOI-to-collection mappings if needed.
 * @param dois -- Normalized DOIs to check to find a collection.
 * @returns CELLxGENE collection info, or null if none is found.
 */
export function getCellxGeneInfoByDoi(dois: string[]): CollectionInfo | null {
  const { collectionInfoByDoi } = refreshService.getData();
  for (const doi of dois) {
    const collectionInfo = collectionInfoByDoi.get(doi);
    if (collectionInfo !== undefined) return collectionInfo;
  }
  return null;
}

export function getCellxGeneCollectionInfoById(
  collectionId: string
): CollectionInfo | undefined {
  return refreshService.getData().collectionInfoById.get(collectionId);
}

/**
 * Fetch CELLxGENE collections and build DOI-to-ID mapping.
 * @returns collection IDs by DOI.
 */
async function getRefreshedCollectionMaps(): Promise<
  Pick<CellxGeneData, "collectionInfoByDoi" | "collectionInfoById">
> {
  const byDoi = new Map<string, CollectionInfo>();
  const byId = new Map<string, CollectionInfo>();
  console.log("Requesting CELLxGENE collections");
  const collections = await getCellxGeneCollections({
    hooks: {
      beforeRetry: [
        (): void => {
          console.log("Retrying CELLxGENE collections request");
        },
      ],
    },
    ...KY_OPTIONS,
  });
  console.log("Loaded CELLxGENE collections");
  for (const { collection_id, doi, name } of collections) {
    const info: CollectionInfo = {
      id: collection_id,
      title: name,
    };
    byId.set(collection_id, info);
    if (doi) byDoi.set(normalizeDoi(doi), info);
  }
  return {
    collectionInfoByDoi: byDoi,
    collectionInfoById: byId,
  };
}
