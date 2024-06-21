import ky, { Options as KyOptions } from "ky";

export interface CellxGeneCollection {
  collection_id: string;
  doi: string | null;
  name: string;
}

export interface CellxGeneDataset {
  assay: { label: string }[];
  cell_count: number;
  collection_id: string;
  dataset_id: string;
  dataset_version_id: string;
  disease: { label: string }[];
  explorer_url: string;
  suspension_type: string[];
  tissue: { label: string }[];
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
