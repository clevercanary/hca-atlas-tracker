import os
import json
import requests
import anndata as ad

TRACKER_CELLXGENE_IDS_URL = "http://localhost:3000/api/cellxgene-source-datasets"
CELLXGENE_DATASETS_URL = "https://api.cellxgene.cziscience.com/curation/v1/datasets"

JSON_PATH = "catalog/output/cellxgene-datasets-info.json"
TEMP_PATH = "catalog/build/temporary"
DOWNLOADS_PATH = f"{TEMP_PATH}/downloads"
TEMP_JSON_PATH = f"{TEMP_PATH}/in-progress-info.json"
TEMP_CELLXGENE_DATASETS_PATH = f"{TEMP_PATH}/cellxgene-datasets.json"

HCA_REQUIRED_FIELDS = [
    "alignment_software",
    "cell_enrichment",
    "gene_annotation_version",
    "institute",
    "library_id",
    "library_preparation_batch",
    "library_sequencing_run",
    "manner_of_death",
    "reference_genome",
    "sampled_site_condition",
    "sample_collection_method",
    "sample_id",
    "sample_preservation_method",
    "sample_source",
    "sequenced_fragment",
]

DATASET_BATCH_SIZE = 25

def read_json_file(path):
  with open(path) as file:
    return json.load(file)

def write_json_file(path, value):
  with open(path, "w") as file:
    json.dump(value, file)

def get_tier_one_status(file_path):
  adata = ad.read_h5ad(file_path)
  prev_bool = None
  for col in HCA_REQUIRED_FIELDS:
    col_bools = adata.obs[col].isnull().unique() if col in adata.obs.columns else [False]
    if len(col_bools) == 2:
      return "INCOMPLETE"
    elif prev_bool is None:
      prev_bool = col_bools[0]
    elif col_bools[0] != prev_bool:
      return "INCOMPLETE"
  return "MISSING" if prev_bool is None else "COMPLETE" if prev_bool else "INCOMPLETE"

def download_file(url, download_path, download_name, file_size):
  print(f"Downloading {download_name} (0.00%)", end="\r")
  downloaded_size = 0
  with requests.get(url, stream=True) as r:
    r.raise_for_status()
    with open(download_path, "wb") as f:
      for chunk in r.iter_content(chunk_size=8192): 
        f.write(chunk)
        downloaded_size += len(chunk)
        print(f"Downloading {download_name} ({downloaded_size/file_size * 100 :.2f}%)", end="\r")
  print("")

def missing_dataset_info():
  return {
    "collectionId": None,
    "datasetVersionId": None,
    "tierOneStatus": "MISSING"
  }

def get_latest_dataset_info(dataset_id, cellxgene_datasets_by_id):
  if dataset_id not in cellxgene_datasets_by_id:
    print(f"{dataset_id} not found on CELLxGENE")
    return missing_dataset_info()
  
  dataset = cellxgene_datasets_by_id[dataset_id]

  try:
    file_info = next(file for file in dataset["assets"] if file["filetype"].upper() == "H5AD")
  except StopIteration:
    print(f"H5AD URL not found for {dataset_id}")
    return missing_dataset_info()
  
  download_name = f"{dataset["dataset_version_id"]}.h5ad"
  download_path = f"{DOWNLOADS_PATH}/{download_name}"

  try:
    download_file(file_info["url"], download_path, download_name, file_info["filesize"])
  except requests.RequestException:
    print(f"Download of {download_name} failed")
    if os.path.exists(download_path):
      os.remove(download_path)
    return missing_dataset_info()
  
  print(f"Reading {download_name}")

  tier_one_status = get_tier_one_status(download_path)
  
  os.remove(download_path)

  return {
    "collectionId": dataset["collection_id"],
    "datasetVersionId": dataset["dataset_version_id"],
    "tierOneStatus": tier_one_status
  }

def has_latest_dataset_version(prev_info, dataset_id, cellxgene_datasets_by_id):
  return dataset_id in prev_info and dataset_id in cellxgene_datasets_by_id and prev_info[dataset_id]["datasetVersionId"] == cellxgene_datasets_by_id[dataset_id]["dataset_version_id"]

def get_cellxgene_datasets_info():
  if not os.path.exists(DOWNLOADS_PATH):
    os.makedirs(DOWNLOADS_PATH)

  prev_info = read_json_file(JSON_PATH)
  
  cellxgene_datasets_by_id = None

  if os.path.exists(TEMP_JSON_PATH):
    print(f"Restoring previous run from {TEMP_JSON_PATH}")
    prev_run_info = read_json_file(TEMP_JSON_PATH)
    prev_info = {**prev_info, **prev_run_info}
    if os.path.exists(TEMP_CELLXGENE_DATASETS_PATH):
      cellxgene_datasets_by_id = read_json_file(TEMP_CELLXGENE_DATASETS_PATH)

  tracker_cellxgene_ids = requests.get(TRACKER_CELLXGENE_IDS_URL).json()[:15]

  if cellxgene_datasets_by_id is None:
    print("Requesting CELLxGENE datasets")
    cellxgene_datasets_by_id = {dataset["dataset_id"]: dataset for dataset in requests.get(CELLXGENE_DATASETS_URL).json()}
    write_json_file(TEMP_CELLXGENE_DATASETS_PATH, cellxgene_datasets_by_id)

  new_info = {}

  print("Updating saved info")

  ids_to_update = []

  for dataset_id in tracker_cellxgene_ids:
    if has_latest_dataset_version(prev_info, dataset_id, cellxgene_datasets_by_id):
      new_info[dataset_id] = prev_info[dataset_id]
    else:
      ids_to_update.append(dataset_id)

  for index, dataset_id in enumerate(ids_to_update):
    print(f"Processing {dataset_id} ({index + 1}/{len(ids_to_update)})")
    new_info[dataset_id] = get_latest_dataset_info(dataset_id, cellxgene_datasets_by_id)
    write_json_file(TEMP_JSON_PATH, new_info)
  
  write_json_file(JSON_PATH, new_info)

  os.remove(TEMP_JSON_PATH)

  print(f"Done")

if __name__ == "__main__":
  get_cellxgene_datasets_info()
