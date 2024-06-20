import { HCAAtlasTrackerSourceDataset } from "../../../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormMethod } from "../../../../../../../../../../../../hooks/useForm/common/entities";
import { getAtlasSourceStudiesSourceDatasetsTableColumns } from "../../../../../../../../../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { SourceStudiesSourceDatasetsEditData } from "../../../../../../../../../ViewSourceStudiesSourceDatasets/common/entities";
import { SectionTable } from "../../../../../../section.styles";
import { useSourceStudiesSourceDatasetsTableOptions } from "../../../../hooks/useSourceStudiesSourceDatasetsTableOptions";
import { useUpdateSourceStudiesSourceDatasetsFormState } from "../../../../hooks/useUpdateSourceStudiesSourceDatasetsFormState";

export interface TableProps {
  formMethod: FormMethod<
    SourceStudiesSourceDatasetsEditData,
    HCAAtlasTrackerSourceDataset[]
  >;
  sourceStudiesSourceDatasets?: HCAAtlasTrackerSourceDataset[];
}

export const Table = ({
  formMethod,
  sourceStudiesSourceDatasets,
}: TableProps): JSX.Element => {
  const tableOptions = useSourceStudiesSourceDatasetsTableOptions(formMethod);
  useUpdateSourceStudiesSourceDatasetsFormState(formMethod, tableOptions);
  return (
    <SectionTable
      columns={getAtlasSourceStudiesSourceDatasetsTableColumns()}
      gridTemplateColumns="minmax(260px, 1fr) minmax(200px, 0.5fr) repeat(3, minmax(120px, 0.4fr)) minmax(100px, 0.4fr)"
      items={sourceStudiesSourceDatasets || []}
      tableOptions={{
        ...tableOptions,
        getRowId: (row) => row.id,
      }}
      tableView={{ table: { stickyHeader: true } }}
    />
  );
};
