import { GridPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/paper.styles";
import { Table } from "@databiosphere/findable-ui/lib/components/Detail/components/Table/table";
import {
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerSourceDataset,
} from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { sortLinkedSourceDataset } from "../../../../components/Detail/common/utils";
import { StyledFluidPaper } from "../../../../components/Table/components/TablePaper/tablePaper.styles";
import { TablePlaceholder } from "../../../../components/Table/components/TablePlaceholder/tablePlaceholder";
import { FormManager as FormManagerProps } from "../../../../hooks/useFormManager/common/entities";
import { getAtlasSourceDatasetsTableColumns } from "../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
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
              gridTemplateColumns="max-content minmax(110px, auto) minmax(180px, 1fr) minmax(180px, 1fr) repeat(8, minmax(120px, 0.5fr))"
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
