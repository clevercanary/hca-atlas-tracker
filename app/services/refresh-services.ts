import { isCellxGeneRefreshing } from "./cellxgene";
import {
  getComponentAtlasIdsHavingSourceDatasets,
  updateComponentAtlasFieldsFromDatasets,
} from "./component-atlases";
import { areProjectsRefreshing } from "./hca-projects";
import { updateCellxGeneSourceDatasets } from "./source-datasets";
import { updateSourceStudyExternalIds } from "./source-studies";
import { refreshValidations } from "./validations";

export async function doUpdatesIfRefreshesComplete(): Promise<void> {
  if (!isAnyServiceRefreshing()) {
    await updateSourceStudyExternalIds();

    const updatedSourceDatasetIds = await updateCellxGeneSourceDatasets();

    await updateComponentAtlasFieldsFromDatasets(
      await getComponentAtlasIdsHavingSourceDatasets(updatedSourceDatasetIds)
    );

    await refreshValidations();
  }
}

export function isAnyServiceRefreshing(): boolean {
  return areProjectsRefreshing() || isCellxGeneRefreshing();
}
