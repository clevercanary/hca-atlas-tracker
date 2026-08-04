import { type HCAAtlasTrackerSourceDataset } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { CORE_OPTIONS } from "@/app/components/Table/options/core/constants";
import { type FormMethod } from "@/app/hooks/useForm/common/entities";
import { type ComponentAtlasSourceDatasetsEditData } from "@/app/views/IntegratedObjectSourceDatasetsView/components/ViewComponentAtlasSourceDatasetsSelection/common/entities";
import { COLUMNS } from "@/app/views/IntegratedObjectSourceDatasetsView/components/ViewComponentAtlasSourceDatasetsSelection/components/ComponentAtlasSourceDatasetsSelection/components/FormContent/components/Table/columns";
import { useComponentAtlasSourceDatasetsSelectionFormState } from "@/app/views/IntegratedObjectSourceDatasetsView/components/ViewComponentAtlasSourceDatasetsSelection/components/ComponentAtlasSourceDatasetsSelection/hooks/useComponentAtlasSourceDatasetsSelectionFormState";
import { useComponentAtlasSourceDatasetsSelectionTableOptions } from "@/app/views/IntegratedObjectSourceDatasetsView/components/ViewComponentAtlasSourceDatasetsSelection/components/ComponentAtlasSourceDatasetsSelection/hooks/useComponentAtlasSourceDatasetsSelectionTableOptions";
import { useReactTable } from "@tanstack/react-table";
import { type UseComponentAtlasSourceDatasetsSelectionTable } from "./entities";

// Stable empty-array fallback so `useReactTable` always gets a referentially
// stable `data` prop (the associated atlas source datasets can be undefined
// while pending); a fresh `[]` default would trigger an infinite re-render loop.
const NO_ATLAS_SOURCE_DATASETS: HCAAtlasTrackerSourceDataset[] = [];

export const useComponentAtlasSourceDatasetsSelectionTable = (
  formMethod: FormMethod<
    ComponentAtlasSourceDatasetsEditData,
    HCAAtlasTrackerSourceDataset[]
  >,
  atlasSourceDatasets: HCAAtlasTrackerSourceDataset[] = NO_ATLAS_SOURCE_DATASETS,
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
