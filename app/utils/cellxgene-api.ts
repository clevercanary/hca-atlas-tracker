import ky, { Options as KyOptions } from "ky";

export interface CellxGeneCollection {
  collection_id: string;
  doi: string | null;
  name: string;
}

const API_URL_COLLECTIONS =
  "https://api.cellxgene.cziscience.com/curation/v1/collections";

export async function getCellxGeneCollections(
  kyOptions?: KyOptions
): Promise<CellxGeneCollection[]> {
  return await ky(API_URL_COLLECTIONS, kyOptions).json();
}
