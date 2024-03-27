import { HCAAtlasTrackerComponentAtlas } from "app/apis/catalog/hca-atlas-tracker/common/entities";
import { processNullElements } from "./apis/azul/utils";
import { CXGDataset } from "./apis/cellxgene";
import { AtlasBase } from "./entities";

export async function buildAtlasComponentAtlases(
  atlasBase: AtlasBase
): Promise<HCAAtlasTrackerComponentAtlas[]> {
  const cxgDatasets: CXGDataset[] = [];
  if (atlasBase.cxgCollectionId) {
    const response = await fetch(
      `https://api.cellxgene.cziscience.com/curation/v1/collections/${atlasBase.cxgCollectionId}`
    );
    const cxgCollection = await response.json();
    cxgDatasets.push(
      ...mapCxgDatasets(cxgCollection.datasets, cxgCollection.collection_id)
    );
    cxgDatasets.sort(sortCXGDatasets);
  }
  return cxgDatasets.map((cxgDataset) => ({
    atlasKey: atlasBase.atlasKey,
    atlasTitle: atlasBase.atlasTitle,
    bioNetwork: atlasBase.bioNetwork,
    cellCount: cxgDataset.cell_count,
    componentAtlasName: cxgDataset.title,
    cxgCollectionId: cxgDataset.collection_id,
    cxgDatasetId: cxgDataset.dataset_id,
    cxgExploreUrl: cxgDataset.explorer_url,
    disease: processArrayValue(cxgDataset.disease, "label"),
    tissue: processArrayValue(cxgDataset.tissue, "label"),
  }));
}

/**
 * Returns CELLxGENE datasets with the corresponding collection ID.
 * @param cxgDatasets - CELLxGENE dataset responses.
 * @param collection_id - Collection ID.
 * @returns CELLxGENE datasets.
 */
function mapCxgDatasets(
  cxgDatasets: Omit<CXGDataset, "collection_id">[],
  collection_id: string
): CXGDataset[] {
  return cxgDatasets.map((cxgDataset) => ({ ...cxgDataset, collection_id }));
}

/**
 * Sort datasets by cell count, descending.
 * @param d0 - First dataset to compare.
 * @param d1 - Second dataset to compare.
 * @returns Number indicating sort precedence of d0 vs d1.
 */
function sortCXGDatasets(d0: CXGDataset, d1: CXGDataset): number {
  return d1.cell_count - d0.cell_count;
}

/**
 * Returns the unique string values of the given array object.
 * @param values - List of values.
 * @param key - Key of the value to extract.
 * @returns unique list of values.
 */
function processArrayValue<T>(values: T[], key: keyof T): string[] {
  const setOfValues = new Set(
    values.map((value) => value[key] as unknown as string)
  );
  return processNullElements(sort([...setOfValues]));
}

/**
 * Sorts the given values in ascending order.
 * @param values - Values.
 * @returns values sorted.
 */
function sort(values: string[]): string[] {
  return values.sort((a, b) => a.localeCompare(b));
}
