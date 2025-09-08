import {
  TEST_CELLXGENE_COLLECTIONS_BY_DOI,
  TEST_CELLXGENE_COLLECTIONS_BY_ID,
} from "../../../testing/constants";
import { CollectionInfo } from "../cellxgene";

export function isCellxGeneRefreshing(): boolean {
  return false;
}

export function getCellxGeneIdByDoi(dois: string[]): string | null {
  return getCellxGeneInfoByDoi(dois)?.id ?? null;
}

export function getCellxGeneInfoByDoi(dois: string[]): CollectionInfo | null {
  for (const doi of dois) {
    const collection = TEST_CELLXGENE_COLLECTIONS_BY_DOI.get(doi);
    if (collection)
      return {
        id: collection.collection_id,
        title: collection.name,
      };
  }
  return null;
}

export function getCellxGeneCollectionInfoById(
  collectionId: string
): CollectionInfo | undefined {
  return TEST_CELLXGENE_COLLECTIONS_BY_ID.get(collectionId);
}
