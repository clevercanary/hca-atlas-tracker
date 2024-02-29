import { LABEL } from "@clevercanary/data-explorer-ui/lib/apis/azul/common/entities";

export interface IntegratedAtlas {
  assay: string[];
  cellCount: number;
  cxgId: string;
  cxgURL: string;
  datasetAssets: DatasetAsset[];
  disease: string[];
  name: string;
  organism: string[];
  tissue: string[];
}

export interface CXGAssay {
  label: string;
}

export interface CXGDataset {
  assay: CXGAssay[];
  assets: CXGDatasetAsset[];
  cell_count: number;
  collection_id: string;
  dataset_id: string;
  disease: CXGDisease[];
  explorer_url: string;
  organism: CXGOrganism[];
  tissue: CXGTissue[];
  title: string;
}

export interface CXGDatasetAsset {
  filesize: number;
  filetype: CXG_DATASET_FILE_TYPE;
  url: string;
}

export enum CXG_DATASET_FILE_TYPE {
  H5AD = "H5AD",
  RDS = "RDS",
}

export interface CXGDisease {
  label: string;
}

export interface CXGOrganism {
  label: string;
}

export interface CXGTissue {
  label: string;
}

export async function buildAtlasComponentAtlases(
  cxgId: string
): Promise<IntegratedAtlas[]> {
  const cxgDatasets: CXGDataset[] = [];
  const response = await fetch(
    `https://api.cellxgene.cziscience.com/curation/v1/collections/${cxgId}`
  );
  const cxgCollection = await response.json();
  cxgDatasets.push(
    ...mapDatasets(cxgCollection.datasets, cxgCollection.collection_id)
  );
  cxgDatasets.sort(sortCXGDatasets);
  return cxgDatasets.map(mapIntegratedAtlas);
}

/**
 * Returns CELLxGENE datasets with the corresponding collection ID.
 * @param cxgDatasets - CELLxGENE dataset responses.
 * @param collection_id - Collection ID.
 * @returns CELLxGENE datasets.
 */
function mapDatasets(
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
 * Maps the given CELLxGENE dataset to an integrated atlas.
 * @param cxgDataset - CELLxGENE dataset.
 * @returns integrated atlas.
 */
export function mapIntegratedAtlas(cxgDataset: CXGDataset): IntegratedAtlas {
  return {
    assay: processArrayValue(cxgDataset.assay, "label"),
    cellCount: cxgDataset.cell_count,
    cxgId: cxgDataset.collection_id,
    cxgURL: cxgDataset.explorer_url,
    datasetAssets: buildDatasetAssets(cxgDataset.assets),
    disease: processArrayValue(cxgDataset.disease, "label"),
    name: cxgDataset.title,
    organism: processArrayValue(cxgDataset.organism, "label"),
    tissue: processArrayValue(cxgDataset.tissue, "label"),
  };
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

/**
 * Type of possible values returned in an aggregated value from Azul.
 */
type StringOrNullArray = (string | null)[] | undefined;

/**
 * Remove null elements from the given array.
 * @param values - List of values.
 * @returns an array with no null elements.
 */
function filterDefinedValues(values?: StringOrNullArray): string[] | undefined {
  return values?.filter((value): value is string => !!value);
}

/**
 * Remove null elements, if any, from the given array.
 * @param values - Array to remove null elements from.
 * @returns Array with null elements removed.
 */
export function processNullElements(values: StringOrNullArray): string[] {
  // Remove any nulls from given array
  const filteredValues = filterDefinedValues(values); // Handle possible [null] values

  // Handle undefined or empty lists: caller is expecting "Unspecified", not an empty array.
  if (!filteredValues || filteredValues?.length === 0) {
    return [LABEL.UNSPECIFIED];
  }

  return filteredValues;
}

export interface DatasetAsset {
  downloadURL: string;
  fileSize: number;
  fileType: CXG_DATASET_FILE_TYPE;
}

/**
 * Returns the H5AD and RDS dataset assets for the given CELLxGENE dataset assets.
 * @param cxgDatasetAssets - CELLxGENE dataset assets.
 * @returns H5AD and RDS dataset assets.
 */
function buildDatasetAssets(
  cxgDatasetAssets: CXGDatasetAsset[]
): DatasetAsset[] {
  return cxgDatasetAssets
    .filter(filterCXGDatasetAsset)
    .map((cxgDatasetAsset) => {
      return {
        downloadURL: cxgDatasetAsset.url,
        fileSize: cxgDatasetAsset.filesize,
        fileType: cxgDatasetAsset.filetype,
      };
    });
}

/**
 * Returns true if the dataset asset's filetype is H5AD or RDS.
 * @param cxgDatasetAsset - CELLxGENE dataset asset.
 * @returns true if the dataset asset's filetype is H5AD or RDS.
 */
function filterCXGDatasetAsset(cxgDatasetAsset: CXGDatasetAsset): boolean {
  return (
    cxgDatasetAsset.filetype === CXG_DATASET_FILE_TYPE.H5AD ||
    cxgDatasetAsset.filetype === CXG_DATASET_FILE_TYPE.RDS
  );
}
