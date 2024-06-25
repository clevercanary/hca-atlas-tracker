import { Row, RowSelectionState } from "@tanstack/react-table";
import { FormState } from "react-hook-form";
import { HCAAtlasTrackerSourceDataset } from "../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormMethod } from "../../../../../../../../../hooks/useForm/common/entities";
import {
  PartialTableOptions,
  useTableOptions,
} from "../../../../../../../../../hooks/useTableOptions";
import { FIELD_NAME } from "../../../../../../ViewSourceStudiesSourceDatasets/common/constants";
import { SourceStudiesSourceDatasetsEditData } from "../../../../../../ViewSourceStudiesSourceDatasets/common/entities";
import { TABLE_OPTIONS } from "../components/FormContent/components/Table/common/constants";

export const useSourceStudiesSourceDatasetsTableOptions = (
  formMethod: FormMethod<
    SourceStudiesSourceDatasetsEditData,
    HCAAtlasTrackerSourceDataset[]
  >
): PartialTableOptions<HCAAtlasTrackerSourceDataset> => {
  return useTableOptions<HCAAtlasTrackerSourceDataset>(
    getInitialTableOptions(formMethod)
  );
};

/**
 * Returns true if row selection is enabled.
 * @param row - Row.
 * @param defaultValues - Form default values.
 * @returns true if row selection is enabled.
 */
function enableRowSelection(
  row: Row<HCAAtlasTrackerSourceDataset>,
  defaultValues: FormState<SourceStudiesSourceDatasetsEditData>["defaultValues"]
): boolean {
  const { sourceDatasetIds } = defaultValues || {};
  if (!sourceDatasetIds) return true;
  const {
    original: { id },
  } = row;
  return !sourceDatasetIds.includes(id);
}

/**
 * Returns true if sub row selection is enabled i.e. any sub row is selectable.
 * @param row - Row.
 * @param defaultValues - Form default values.
 * @returns true if sub row selection is enabled.
 */
function enableSubRowSelection(
  row: Row<HCAAtlasTrackerSourceDataset>,
  defaultValues: FormState<SourceStudiesSourceDatasetsEditData>["defaultValues"]
): boolean {
  const { sourceDatasetIds } = defaultValues || {};
  if (!sourceDatasetIds) return true;
  return row.subRows.some(({ getCanSelect }) => getCanSelect());
}

/**
 * Returns the initial row selection.
 * @param defaultValues - Form default values.
 * @returns row selection.
 */
function getInitialRowSelection(
  defaultValues: FormState<SourceStudiesSourceDatasetsEditData>["defaultValues"]
): RowSelectionState {
  const sourceDatasetsIds = defaultValues?.[FIELD_NAME.SOURCE_DATASET_IDS];
  if (!sourceDatasetsIds) return {};
  return sourceDatasetsIds.reduce((acc, sourceDatasetId) => {
    if (!sourceDatasetId) return acc;
    return {
      ...acc,
      [sourceDatasetId]: true,
    };
  }, {} as RowSelectionState);
}

/**
 * Returns the initial table options.
 * @param formMethod - Form method.
 * @returns initial table options.
 */
function getInitialTableOptions(
  formMethod: FormMethod<
    SourceStudiesSourceDatasetsEditData,
    HCAAtlasTrackerSourceDataset[]
  >
): PartialTableOptions<HCAAtlasTrackerSourceDataset> {
  const {
    formState: { defaultValues },
  } = formMethod;
  return {
    ...TABLE_OPTIONS,
    enableRowSelection: (row) => enableRowSelection(row, defaultValues),
    enableSubRowSelection: (row) => enableSubRowSelection(row, defaultValues),
    initialState: {
      ...TABLE_OPTIONS.initialState,
      rowSelection: getInitialRowSelection(defaultValues),
    },
  };
}
