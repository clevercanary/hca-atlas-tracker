import { useReactTable } from "@tanstack/react-table";
import { HCAAtlasTrackerSourceDataset } from "../../../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { CORE_OPTIONS } from "../../../../../../../../../../../../components/Table/options/core/constants";
import { FormMethod } from "../../../../../../../../../../../../hooks/useForm/common/entities";
import { ComponentAtlasSourceDatasetsEditData } from "../../../../../../../../common/entities";
import { useComponentAtlasSourceDatasetsSelectionFormState } from "../../../../../../hooks/useComponentAtlasSourceDatasetsSelectionFormState";
import { useComponentAtlasSourceDatasetsSelectionTableOptions } from "../../../../../../hooks/useComponentAtlasSourceDatasetsSelectionTableOptions";
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
