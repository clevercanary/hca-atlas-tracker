import {
  TEST_CELLXGENE_COLLECTIONS_BY_DOI,
  TEST_CELLXGENE_COLLECTIONS_BY_ID,
} from "../../../testing/constants";
import { CollectionInfo } from "../cellxgene";
import { RefreshDataOption } from "../common/refresh-service";

export function isCellxGeneRefreshing(): boolean {
  return false;
}

export function getCellxGeneIdByDoi(
  dois: string[]
): RefreshDataOption<string | null> {
  return getCellxGeneInfoByDoi(dois).mapRefresh((info) => info?.id ?? null);
}

export function getCellxGeneInfoByDoi(
  dois: string[]
): RefreshDataOption<CollectionInfo | null> {
  for (const doi of dois) {
    const collection = TEST_CELLXGENE_COLLECTIONS_BY_DOI.get(doi);
    if (collection)
      return RefreshDataOption.some({
        id: collection.collection_id,
        title: collection.name,
      });
  }
  return RefreshDataOption.some(null);
}

export function getCellxGeneCollectionInfoById(
  collectionId: string
): RefreshDataOption<CollectionInfo | undefined> {
  return RefreshDataOption.some(
    TEST_CELLXGENE_COLLECTIONS_BY_ID.get(collectionId)
  );
}
