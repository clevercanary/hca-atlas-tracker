import os
import requests
import pandas as pd
from get_cellxgene_files_info import CELLXGENE_DATASETS_URL, TEMP_PATH, DOWNLOADS_PATH, JSON_PATH, TIER_ONE_INCOMPLETE, HCA_REQUIRED_FIELDS, read_json_file, write_json_file, download_and_read_dataset_file

CELLXGENE_COLLECTIONS_URL = "https://api.cellxgene.cziscience.com/curation/v1/collections"

TEMP_REPORT_JSON_PATH = f"{TEMP_PATH}/in-progress-report.json"
REPORT_PATH = "catalog/output/incomplete-datasets-report.tsv"

def format_percentage(portion):
  return f"{portion * 100}%"

def get_report_from_data(adata, dataset, publication_string):
  return {
    "dataset_name": dataset["title"],
    "publication_string": publication_string,
    "dataset_id": dataset["dataset_id"],
    "dataset_version_id": dataset["dataset_version_id"],
    "collection_url": f"https://cellxgene.cziscience.com/collections/{dataset["collection_id"]}",
    **{
      col: format_percentage(1 - adata.obs[col].isnull().mean()) if col in adata.obs else "Not present" for col in HCA_REQUIRED_FIELDS
    }
  }

def get_report_for_dataset(dataset, publication_string):
  return download_and_read_dataset_file(dataset, lambda adata: get_report_from_data(adata, dataset, publication_string), True)

def get_publication_string(dataset, cellxgene_collections_by_id):
  collection = cellxgene_collections_by_id[dataset["collection_id"]]
  metadata = collection.get("publisher_metadata")
  if metadata is None:
    return ""
  first_author = metadata["authors"][0]
  author = first_author["family"] if "family" in first_author else first_author["name"]
  journal = metadata["journal"]
  year = metadata["published_year"]
  return f"{author} ({year}) {journal}"

def create_incomplete_datasets_report():
  if not os.path.exists(DOWNLOADS_PATH):
    os.makedirs(DOWNLOADS_PATH)

  report_data = []
  prev_processed_datasets = set()

  if os.path.exists(TEMP_REPORT_JSON_PATH):
    print(f"Restoring previous run from {TEMP_REPORT_JSON_PATH}")
    report_data = read_json_file(TEMP_REPORT_JSON_PATH)
    prev_processed_datasets = {info["dataset_id"] for info in report_data}

  print("Getting CELLxGENE collections")
  cellxgene_collections_by_id = {collection["collection_id"]: collection for collection in requests.get(CELLXGENE_COLLECTIONS_URL).json()}

  print("Getting CELLxGENE datasets")
  cellxgene_datasets_by_id = {dataset["dataset_id"]: dataset for dataset in requests.get(CELLXGENE_DATASETS_URL).json()}

  for dataset_id, dataset_info in read_json_file(JSON_PATH)["datasets"].items():
    if dataset_info["tierOneStatus"] == TIER_ONE_INCOMPLETE and dataset_id not in prev_processed_datasets:
      report_data.append(get_report_for_dataset(cellxgene_datasets_by_id[dataset_id], get_publication_string(cellxgene_datasets_by_id[dataset_id], cellxgene_collections_by_id)))
      write_json_file(TEMP_REPORT_JSON_PATH, report_data)

  df = pd.DataFrame(report_data)
  df.to_csv(REPORT_PATH, sep="\t")

  os.remove(TEMP_REPORT_JSON_PATH)

  print("Done")

if __name__ == "__main__":
  create_incomplete_datasets_report()
