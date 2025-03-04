import { GridPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/paper.styles";
import {
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerSourceDataset,
} from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormManager as FormManagerProps } from "../../../../hooks/useFormManager/common/entities";
import { getAtlasSourceDatasetsTableColumns } from "../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { Paper } from "../../../Table/components/TablePaper/tablePaper.styles";
import { TablePlaceholder } from "../../../Table/components/TablePlaceholder/tablePlaceholder";
import { Table } from "../../../Table/table.styles";
import { sortLinkedSourceDataset } from "../../common/utils";
import { Alert } from "./components/Alert/alert";
import { RequestAccess } from "./components/RequestAccess/requestAccess";
import { TABLE_OPTIONS } from "./constants";
import { SubGrid } from "./viewAtlasSourceDatasets.styles";

interface ViewSourceDatasetsProps {
  atlas?: HCAAtlasTrackerAtlas;
  atlasSourceDatasets?: HCAAtlasTrackerSourceDataset[];
  formManager: FormManagerProps;
}

export const ViewAtlasSourceDatasets = ({
  atlas,
  atlasSourceDatasets = [],
  formManager,
}: ViewSourceDatasetsProps): JSX.Element => {
  const {
    access: { canEdit, canView },
  } = formManager;
  if (!canView) return <RequestAccess />;
  return (
    <SubGrid>
      {/* 'What is a Source Dataset?' */}
      <Alert />
      <Paper>
        <GridPaper>
          {atlas && atlasSourceDatasets.length > 0 && (
            <Table
              columns={getAtlasSourceDatasetsTableColumns(atlas)}
              gridTemplateColumns="max-content minmax(100px, auto) minmax(180px, 0.4fr) minmax(200px, 1fr) minmax(100px, 118px) minmax(230px, 250px)  minmax(88px, 0.4fr) repeat(4, minmax(88px, 0.4fr)) auto"
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
    </SubGrid>
  );
};
