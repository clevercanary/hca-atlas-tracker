export interface CellxGeneCollection {
  collection_id: string;
  doi: string | null;
}

const API_URL_COLLECTIONS =
  "https://api.cellxgene.cziscience.com/curation/v1/collections";

export async function getCellxGeneCollections(): Promise<
  CellxGeneCollection[]
> {
  const res = await fetch(API_URL_COLLECTIONS);
  if (res.status !== 200)
    throw new Error(`Received status ${res.status} from CELLxGENE`);
  return await res.json();
}
