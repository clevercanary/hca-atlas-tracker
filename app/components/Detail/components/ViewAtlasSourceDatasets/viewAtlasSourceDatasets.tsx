import { GridPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/paper.styles";
import { Table } from "@databiosphere/findable-ui/lib/components/Detail/components/Table/table";
import {
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerSourceDataset,
} from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormManager as FormManagerProps } from "../../../../hooks/useFormManager/common/entities";
import { getAtlasSourceDatasetsTableColumns } from "../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { StyledFluidPaper } from "../../../Table/components/TablePaper/tablePaper.styles";
import { TablePlaceholder } from "../../../Table/components/TablePlaceholder/tablePlaceholder";
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
    access: { canView },
  } = formManager;
  if (!canView) return <RequestAccess />;
  return (
    <SubGrid>
      {/* 'What is a Source Dataset?' */}
      <Alert />
      <StyledFluidPaper elevation={0}>
        <GridPaper>
          {atlas && atlasSourceDatasets.length > 0 && (
            <Table
              columns={getAtlasSourceDatasetsTableColumns(atlas)}
              gridTemplateColumns="max-content minmax(110px, auto) minmax(180px, 0.4fr) minmax(200px, 1fr) minmax(110px, 120px) minmax(175px, 195px) minmax(200px, 1fr) repeat(7, minmax(120px, 0.5fr))"
              items={atlasSourceDatasets.sort(sortLinkedSourceDataset)}
              tableOptions={TABLE_OPTIONS}
            />
          )}
          <TablePlaceholder
            message="No source datasets"
            rowCount={atlasSourceDatasets.length}
          />
        </GridPaper>
      </StyledFluidPaper>
    </SubGrid>
  );
};
