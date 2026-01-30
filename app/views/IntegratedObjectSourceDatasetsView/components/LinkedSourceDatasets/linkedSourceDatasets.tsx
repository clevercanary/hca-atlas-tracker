import { JSX } from "react";
import { FluidPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/components/FluidPaper/fluidPaper";
import { GridPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/paper.styles";
import { HCAAtlasTrackerSourceDataset } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../../common/entities";
import { TablePlaceholder } from "../../../../components/Table/components/TablePlaceholder/tablePlaceholder";
import { StyledToolbar } from "../../../../components/Table/components/TableToolbar/tableToolbar.styles";
import { FormManager } from "../../../../hooks/useFormManager/common/entities";
import { ViewComponentAtlasSourceDatasetsSelection } from "../ViewComponentAtlasSourceDatasetsSelection/viewComponentAtlasSourceDatasetsSelection";
import { Table } from "./components/Table/table";

export interface LinkedSourceDatasetsProps {
  atlasSourceDatasets: HCAAtlasTrackerSourceDataset[];
  componentAtlasIsArchived: boolean;
  componentAtlasSourceDatasets: HCAAtlasTrackerSourceDataset[];
  formManager: FormManager;
  pathParameter: PathParameter;
}

export const LinkedSourceDatasets = ({
  atlasSourceDatasets,
  componentAtlasIsArchived,
  componentAtlasSourceDatasets,
  formManager,
  pathParameter,
}: LinkedSourceDatasetsProps): JSX.Element => {
  const {
    access: { canEdit },
  } = formManager;
  return (
    <FluidPaper elevation={0}>
      <GridPaper>
        {canEdit && (
          <StyledToolbar>
            <ViewComponentAtlasSourceDatasetsSelection
              componentAtlasIsArchived={componentAtlasIsArchived}
              componentAtlasSourceDatasets={componentAtlasSourceDatasets}
              pathParameter={pathParameter}
              atlasSourceDatasets={atlasSourceDatasets}
            />
          </StyledToolbar>
        )}
        {componentAtlasSourceDatasets.length > 0 && (
          <Table
            canEdit={canEdit}
            componentAtlasSourceDatasets={componentAtlasSourceDatasets}
            pathParameter={pathParameter}
          />
        )}
        <TablePlaceholder
          canEdit={canEdit}
          message="No linked source datasets"
          rowCount={componentAtlasSourceDatasets.length}
        />
      </GridPaper>
    </FluidPaper>
  );
};
