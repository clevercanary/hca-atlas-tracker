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
