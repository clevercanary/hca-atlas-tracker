import { useReactTable } from "@tanstack/react-table";
import { HCAAtlasTrackerSourceDataset } from "app/apis/catalog/hca-atlas-tracker/common/entities";
import { CORE_OPTIONS } from "app/components/Table/options/core/constants";
import { FormMethod } from "app/hooks/useForm/common/entities";
import { ComponentAtlasSourceDatasetsEditData } from "app/views/IntegratedObjectSourceDatasetsView/components/ViewComponentAtlasSourceDatasetsSelection/common/entities";
import { useComponentAtlasSourceDatasetsSelectionFormState } from "app/views/IntegratedObjectSourceDatasetsView/components/ViewComponentAtlasSourceDatasetsSelection/components/ComponentAtlasSourceDatasetsSelection/hooks/useComponentAtlasSourceDatasetsSelectionFormState";
import { useComponentAtlasSourceDatasetsSelectionTableOptions } from "app/views/IntegratedObjectSourceDatasetsView/components/ViewComponentAtlasSourceDatasetsSelection/components/ComponentAtlasSourceDatasetsSelection/hooks/useComponentAtlasSourceDatasetsSelectionTableOptions";
import { COLUMNS } from "../../columns";
import { UseComponentAtlasSourceDatasetsSelectionTable } from "./entities";

export const useComponentAtlasSourceDatasetsSelectionTable = (
  formMethod: FormMethod<
    ComponentAtlasSourceDatasetsEditData,
    HCAAtlasTrackerSourceDataset[]
  >,
  atlasSourceDatasets: HCAAtlasTrackerSourceDataset[] = [],
): UseComponentAtlasSourceDatasetsSelectionTable => {
  const tableOptions =
    useComponentAtlasSourceDatasetsSelectionTableOptions(formMethod);
  useComponentAtlasSourceDatasetsSelectionFormState(formMethod, tableOptions);

  const table = useReactTable<HCAAtlasTrackerSourceDataset>({
    columns: COLUMNS,
    data: atlasSourceDatasets,
    ...CORE_OPTIONS,
    ...tableOptions,
    getRowId: (row) => row.id,
  });

  return { table };
};
