import ky, { Options as KyOptions } from "ky";

export interface CellxGeneCollection {
  collection_id: string;
  doi: string | null;
  name: string;
}

export interface CellxGeneDataset {
  cell_count: number;
  collection_id: string;
  dataset_id: string;
  dataset_version_id: string;
  title: string;
}

const API_URL_COLLECTIONS =
  "https://api.cellxgene.cziscience.com/curation/v1/collections";
const API_URL_DATASETS =
  "https://api.cellxgene.cziscience.com/curation/v1/datasets";

export async function getCellxGeneCollections(
  kyOptions?: KyOptions
): Promise<CellxGeneCollection[]> {
  return await ky(API_URL_COLLECTIONS, kyOptions).json();
}

export async function getCellxGeneDatasets(
  kyOptions?: KyOptions
): Promise<CellxGeneDataset[]> {
  return await ky(API_URL_DATASETS, kyOptions).json();
}
