import os
import json
import requests
import anndata as ad

TRACKER_CELLXGENE_IDS_URLS = "http://localhost:3000/api/cellxgene-source-datasets"
CELLXGENE_DATASETS_URL = "https://api.cellxgene.cziscience.com/curation/v1/datasets"

JSON_PATH = "catalog/output/cellxgene-datasets-info.json"
DOWNLOADS_PATH = "catalog/build/temporary/downloads"

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

def get_has_primary_data(file_path):
  adata = ad.read_h5ad(file_path)
  for col in HCA_REQUIRED_FIELDS:
    if col not in adata.obs.columns:
      return False
    if adata.obs[col].isnull().any():
      return False
  return True

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
    "datasetVersionId": None,
    "hasPrimaryData": False
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
  except:
    print(f"Download of {download_name} failed")
    return missing_dataset_info()
  
  print(f"Reading {download_name}")

  try:
    has_primary_data = get_has_primary_data(download_path)
  except:
    print(f"Failing to read info from {download_name}")
    return missing_dataset_info()
  
  return {
    "datasetVersionId": dataset["dataset_version_id"],
    "hasPrimaryData": has_primary_data
  }

def has_latest_dataset_version(prev_info, dataset_id, cellxgene_datasets_by_id):
  return dataset_id in prev_info and dataset_id in cellxgene_datasets_by_id and prev_info[dataset_id]["datasetVersionId"] == cellxgene_datasets_by_id[dataset_id]["dataset_version_id"]

def get_cellxgene_datasets_info():
  if not os.path.exists(DOWNLOADS_PATH):
    os.makedirs(DOWNLOADS_PATH)

  with open(JSON_PATH) as file:
    prev_info = json.load(file)

  print("Requesting CELLxGENE datasets")

  tracker_cellxgene_ids = requests.get(TRACKER_CELLXGENE_IDS_URLS).json()
  cellxgene_datasets_by_id = {dataset["dataset_id"]: dataset for dataset in requests.get(CELLXGENE_DATASETS_URL).json()}

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

  with open(JSON_PATH, "w") as file:
    json.dump(new_info, file)

  print(f"Done")

if __name__ == "__main__":
  get_cellxgene_datasets_info()
