import { type HCAAtlasTrackerSourceDataset } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type FormMethod } from "@/app/hooks/useForm/common/entities";
import { type PartialTableOptions } from "@/app/hooks/useTableOptions";
import { FIELD_NAME } from "@/app/views/IntegratedObjectSourceDatasetsView/components/ViewComponentAtlasSourceDatasetsSelection/common/constants";
import { type ComponentAtlasSourceDatasetsEditData } from "@/app/views/IntegratedObjectSourceDatasetsView/components/ViewComponentAtlasSourceDatasetsSelection/common/entities";
import { type RowSelectionState } from "@tanstack/react-table";
import { useEffect, useMemo } from "react";

const SET_VALUE_OPTIONS = { shouldDirty: true, shouldValidate: true };

export const useComponentAtlasSourceDatasetsSelectionFormState = (
  formMethod: FormMethod<
    ComponentAtlasSourceDatasetsEditData,
    HCAAtlasTrackerSourceDataset[]
  >,
  tableOptions: PartialTableOptions<HCAAtlasTrackerSourceDataset>,
): void => {
  const { state } = tableOptions || {};
  const { rowSelection } = state || {};
  const { setValue } = formMethod;
  const sourceStudyIds = useMemo(
    () => getSourceStudyIds(rowSelection),
    [rowSelection],
  );

  useEffect(() => {
    // Update the form state with the selected source dataset ids.
    setValue(FIELD_NAME.SOURCE_DATASET_IDS, sourceStudyIds, SET_VALUE_OPTIONS);
  }, [setValue, sourceStudyIds]);
};

/**
 * Returns the source study IDs from the row selection state.
 * @param rowSelection - Row selection state.
 * @returns source study IDs.
 */
function getSourceStudyIds(rowSelection?: RowSelectionState): string[] {
  return Object.keys(rowSelection || []);
}
