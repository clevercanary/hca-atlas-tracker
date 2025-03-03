from itertools import groupby
import os
import json
import requests
import anndata as ad

TIER_ONE_COMPLETE = "COMPLETE"
TIER_ONE_INCOMPLETE = "INCOMPLETE"
TIER_ONE_MISSING = "MISSING"

TRACKER_CELLXGENE_IDS_URL = "https://tracker.data.humancellatlas.org/api/source-study-cellxgene-ids"
CELLXGENE_DATASETS_URL = "https://api.cellxgene.cziscience.com/curation/v1/datasets"

JSON_PATH = "catalog/output/cellxgene-info.json"
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

def read_json_file(path):
  with open(path) as file:
    return json.load(file)

def write_json_file(path, value):
  with open(path, "w") as file:
    json.dump(value, file)

def get_tier_one_status(file_path):
  adata = ad.read_h5ad(file_path)
  prev_is_null = None
  for col in HCA_REQUIRED_FIELDS:
    col_is_nulls = adata.obs[col].isnull().unique() if col in adata.obs.columns else [True]
    if len(col_is_nulls) == 0:
      col_is_nulls = [True]
    if len(col_is_nulls) == 2:
      return TIER_ONE_INCOMPLETE
    elif prev_is_null is None:
      prev_is_null = col_is_nulls[0]
    elif col_is_nulls[0] != prev_is_null:
      return TIER_ONE_INCOMPLETE
  return TIER_ONE_MISSING if prev_is_null is None or prev_is_null else TIER_ONE_COMPLETE

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

def skipped_dataset_info(skipped_reason):
  return {
    "datasetVersionId": None,
    "tierOneStatus": TIER_ONE_MISSING,
    "skippedReason": skipped_reason
  }

def get_latest_dataset_info(dataset):
  try:
    file_info = next(file for file in dataset["assets"] if file["filetype"].upper() == "H5AD")
  except StopIteration:
    print(f"H5AD URL not found for {dataset["dataset_id"]}")
    return skipped_dataset_info("H5AD URL not found")
  
  download_name = f"{dataset["dataset_version_id"]}.h5ad"
  download_path = f"{DOWNLOADS_PATH}/{download_name}"

  try:
    download_file(file_info["url"], download_path, download_name, file_info["filesize"])
  except requests.RequestException:
    print(f"Download of {download_name} failed")
    if os.path.exists(download_path):
      os.remove(download_path)
    return skipped_dataset_info("Download failed")
  
  print(f"Reading {download_name}")

  tier_one_status = get_tier_one_status(download_path)
  
  os.remove(download_path)

  return {
    "datasetVersionId": dataset["dataset_version_id"],
    "tierOneStatus": tier_one_status
  }

def has_latest_dataset_version(prev_datasets_info, dataset):
  prev_dataset_info = prev_datasets_info.get(dataset["dataset_id"])
  if prev_dataset_info is None:
    return False
  return prev_dataset_info["datasetVersionId"] == dataset["dataset_version_id"]

def add_collection_status(collection_info):
  status = None
  for dataset_info in collection_info["datasets"].values():
    dataset_status = dataset_info["tierOneStatus"]
    if dataset_status == TIER_ONE_INCOMPLETE or (status is not None and status != dataset_status):
      status = TIER_ONE_INCOMPLETE
      break
    status = dataset_status
  return {"tierOneStatus": TIER_ONE_MISSING if status is None else status, **collection_info}

def get_cellxgene_datasets_info():
  if not os.path.exists(DOWNLOADS_PATH):
    os.makedirs(DOWNLOADS_PATH)

  prev_datasets_info = read_json_file(JSON_PATH)["datasets"]
  
  new_datasets_info = {}
  cellxgene_datasets_by_collection = None

  if os.path.exists(TEMP_JSON_PATH):
    print(f"Restoring previous run from {TEMP_JSON_PATH}")
    new_datasets_info = read_json_file(TEMP_JSON_PATH)
    if os.path.exists(TEMP_CELLXGENE_DATASETS_PATH):
      cellxgene_datasets_by_collection = read_json_file(TEMP_CELLXGENE_DATASETS_PATH)

  tracker_cellxgene_ids = requests.get(TRACKER_CELLXGENE_IDS_URL).json()

  if cellxgene_datasets_by_collection is None:
    print("Requesting CELLxGENE datasets")
    cellxgene_datasets_by_collection = {
      collection_id: list(datasets) for collection_id, datasets in groupby(requests.get(CELLXGENE_DATASETS_URL).json(), lambda d: d["collection_id"])
    }
    write_json_file(TEMP_CELLXGENE_DATASETS_PATH, cellxgene_datasets_by_collection)

  print("Updating saved info")

  new_collections_info = {}
  datasets_to_update = []

  for collection_id in tracker_cellxgene_ids:
    if collection_id in cellxgene_datasets_by_collection:
      new_collections_info[collection_id] = {"datasets": []}
      for dataset in cellxgene_datasets_by_collection[collection_id]:
        dataset_id = dataset["dataset_id"]
        new_collections_info[collection_id]["datasets"].append(dataset_id)
        if dataset_id in new_datasets_info:
          continue
        if has_latest_dataset_version(prev_datasets_info, dataset):
          new_datasets_info[dataset_id] = prev_datasets_info[dataset_id]
        else:
          datasets_to_update.append(dataset)
    else:
      print(f"Collection {collection_id} not found on CELLxGENE - skipping")

  for index, dataset in enumerate(datasets_to_update):
    collection_id = dataset["collection_id"]
    dataset_id = dataset["dataset_id"]
    print(f"Processing dataset {dataset_id} ({index + 1}/{len(datasets_to_update)}), collection {collection_id}")
    new_datasets_info[dataset_id] = get_latest_dataset_info(dataset)
    write_json_file(TEMP_JSON_PATH, new_datasets_info)
  
  skipped_datasets_info = [(dataset_id, dataset_info["skippedReason"]) for dataset_id, dataset_info in new_datasets_info.items() if "skippedReason" in dataset_info]
  if len(skipped_datasets_info) > 0:
    print("\nSummary of skipped datasets:")
    for dataset_id, reason in skipped_datasets_info:
      print(f"{dataset_id}: {reason}")
    print("")

  write_json_file(JSON_PATH, {"collections": new_collections_info, "datasets": new_datasets_info})

  os.remove(TEMP_JSON_PATH)

  print(f"Done")

if __name__ == "__main__":
  get_cellxgene_datasets_info()
