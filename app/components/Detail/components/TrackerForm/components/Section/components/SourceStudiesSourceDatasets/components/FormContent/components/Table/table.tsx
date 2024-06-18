import { HCAAtlasTrackerSourceDataset } from "../../../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormMethod } from "../../../../../../../../../../../../hooks/useForm/common/entities";
import { getAtlasSourceStudiesSourceDatasetsTableColumns } from "../../../../../../../../../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { SourceStudiesSourceDatasetsEditData } from "../../../../../../../../../ViewSourceStudiesSourceDatasets/common/entities";
import { useSourceStudiesSourceDatasetsTableOptions } from "../../../../hooks/useSourceStudiesSourceDatasetsTableOptions";
import { useUpdateSourceStudiesSourceDatasetsFormState } from "../../../../hooks/useUpdateSourceStudiesSourceDatasetsFormState";
import { DetailTable } from "./table.styles";

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
    <DetailTable
      columns={getAtlasSourceStudiesSourceDatasetsTableColumns()}
      gridTemplateColumns="minmax(260px, 1fr) minmax(200px, auto) minmax(200px, auto) auto"
      items={sourceStudiesSourceDatasets || []}
      tableOptions={{
        ...tableOptions,
        getRowId: (row) => row.id,
      }}
      tableView={{ table: { stickyHeader: true } }}
    />
  );
};
