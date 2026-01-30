import {
  TEST_CELLXGENE_COLLECTIONS_BY_DOI,
  TEST_CELLXGENE_COLLECTIONS_BY_ID,
} from "../../../testing/constants";
import { CollectionInfo } from "../cellxgene";
import { RefreshDataResult } from "../common/refresh-service";

export function isCellxGeneRefreshing(): boolean {
  return false;
}

export function getCellxGeneIdByDoi(
  dois: string[],
): RefreshDataResult<string | null> {
  return getCellxGeneInfoByDoi(dois).mapRefresh((info) => info?.id ?? null);
}

export function getCellxGeneInfoByDoi(
  dois: string[],
): RefreshDataResult<CollectionInfo | null> {
  for (const doi of dois) {
    const collection = TEST_CELLXGENE_COLLECTIONS_BY_DOI.get(doi);
    if (collection)
      return RefreshDataResult.ok({
        id: collection.collection_id,
        title: collection.name,
      });
  }
  return RefreshDataResult.ok(null);
}

export function getCellxGeneCollectionInfoById(
  collectionId: string,
): RefreshDataResult<CollectionInfo | undefined> {
  return RefreshDataResult.ok(
    TEST_CELLXGENE_COLLECTIONS_BY_ID.get(collectionId),
  );
}
