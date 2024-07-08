import { isCellxGeneRefreshing } from "./cellxgene";
import { areProjectsRefreshing } from "./hca-projects";
import { updateCellxGeneSourceDatasets } from "./source-datasets";
import { updateSourceStudyExternalIds } from "./source-studies";
import { refreshValidations } from "./validations";

export async function doUpdatesIfRefreshesComplete(): Promise<void> {
  if (!isAnyServiceRefreshing()) {
    await updateSourceStudyExternalIds();
    await updateCellxGeneSourceDatasets();
    await refreshValidations();
  }
}

export function isAnyServiceRefreshing(): boolean {
  return areProjectsRefreshing() || isCellxGeneRefreshing();
}
