import { HCAAtlasTrackerSourceDataset } from "../../../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormMethod } from "../../../../../../../../../../../../hooks/useForm/common/entities";
import { getComponentAtlasSourceDatasetsSelectionTableColumns } from "../../../../../../../../../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { ComponentAtlasSourceDatasetsEditData } from "../../../../../../../../../ViewComponentAtlasSourceDatasetsSelection/common/entities";
import { SectionTable } from "../../../../../../section.styles";
import { useComponentAtlasSourceDatasetsSelectionFormState } from "../../../../hooks/useComponentAtlasSourceDatasetsSelectionFormState";
import { useComponentAtlasSourceDatasetsSelectionTableOptions } from "../../../../hooks/useComponentAtlasSourceDatasetsSelectionTableOptions";

export interface TableProps {
  atlasSourceDatasets?: HCAAtlasTrackerSourceDataset[];
  formMethod: FormMethod<
    ComponentAtlasSourceDatasetsEditData,
    HCAAtlasTrackerSourceDataset[]
  >;
}

export const Table = ({
  atlasSourceDatasets,
  formMethod,
}: TableProps): JSX.Element => {
  const tableOptions =
    useComponentAtlasSourceDatasetsSelectionTableOptions(formMethod);
  useComponentAtlasSourceDatasetsSelectionFormState(formMethod, tableOptions);
  return (
    <SectionTable
      columns={getComponentAtlasSourceDatasetsSelectionTableColumns()}
      gridTemplateColumns="minmax(260px, 1fr) minmax(200px, 0.5fr) repeat(4, minmax(120px, 0.4fr)) minmax(100px, 0.4fr)"
      items={atlasSourceDatasets || []}
      tableOptions={{
        ...tableOptions,
        getRowId: (row) => row.id,
      }}
      tableView={{ table: { stickyHeader: true } }}
    />
  );
};
