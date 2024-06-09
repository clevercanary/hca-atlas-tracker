import { isCellxGeneRefreshing } from "./cellxgene";
import { areProjectsRefreshing } from "./hca-projects";
import { updateCellxGeneSourceDatasets } from "./source-datasets";
import { refreshValidations } from "./validations";

export async function doUpdatesIfRefreshesComplete(): Promise<void> {
  if (!isAnyServiceRefreshing()) {
    await updateCellxGeneSourceDatasets();
    await refreshValidations();
  }
}

export function isAnyServiceRefreshing(): boolean {
  return areProjectsRefreshing() || isCellxGeneRefreshing();
}
