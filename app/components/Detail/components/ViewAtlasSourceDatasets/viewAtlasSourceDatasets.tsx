import { GridPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/paper.styles";
import { HCAAtlasTrackerSourceDataset } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormManager as FormManagerProps } from "../../../../hooks/useFormManager/common/entities";
import { getAtlasSourceDatasetsTableColumns } from "../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { Paper } from "../../../Table/components/TablePaper/tablePaper.styles";
import { TablePlaceholder } from "../../../Table/components/TablePlaceholder/tablePlaceholder";
import { Table } from "../../../Table/table.styles";
import { sortLinkedSourceDataset } from "../../common/utils";
import { RequestAccess } from "./components/RequestAccess/requestAccess";
import { TABLE_OPTIONS } from "./constants";

interface ViewSourceDatasetsProps {
  atlasSourceDatasets?: HCAAtlasTrackerSourceDataset[];
  formManager: FormManagerProps;
}

export const ViewAtlasSourceDatasets = ({
  atlasSourceDatasets = [],
  formManager,
}: ViewSourceDatasetsProps): JSX.Element => {
  const {
    access: { canEdit, canView },
  } = formManager;
  if (!canView) return <RequestAccess />;
  return (
    <Paper>
      <GridPaper>
        {atlasSourceDatasets.length > 0 && (
          <Table
            columns={getAtlasSourceDatasetsTableColumns()}
            gridTemplateColumns="max-content minmax(180px, 0.4fr) minmax(200px, 1fr) minmax(180px, auto) repeat(4, minmax(88px, 0.4fr)) auto"
            items={atlasSourceDatasets.sort(sortLinkedSourceDataset)}
            tableOptions={TABLE_OPTIONS}
          />
        )}
        <TablePlaceholder
          canEdit={canEdit}
          message="No source datasets"
          rowCount={atlasSourceDatasets.length}
        />
      </GridPaper>
    </Paper>
  );
};
