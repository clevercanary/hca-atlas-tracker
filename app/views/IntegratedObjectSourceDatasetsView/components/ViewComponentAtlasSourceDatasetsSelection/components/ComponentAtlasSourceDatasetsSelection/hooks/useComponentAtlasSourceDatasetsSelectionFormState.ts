import { RowSelectionState } from "@tanstack/react-table";
import { useEffect, useMemo } from "react";
import { HCAAtlasTrackerSourceDataset } from "../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormMethod } from "../../../../../../../hooks/useForm/common/entities";
import { PartialTableOptions } from "../../../../../../../hooks/useTableOptions";
import { FIELD_NAME } from "../../../common/constants";
import { ComponentAtlasSourceDatasetsEditData } from "../../../common/entities";

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
