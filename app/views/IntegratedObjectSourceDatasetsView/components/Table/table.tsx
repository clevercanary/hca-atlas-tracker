import { JSX } from "react";
import { useEntity } from "../../../../providers/entity/hook";
import { Entity } from "../../entities";
import { GridPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/paper.styles";
import { useIntegratedObjectSourceDatasetsTable } from "./hooks/UseIntegratedObjectSourceDatasetsTable/hook";
import { Table as CommonTable } from "../../../../components/Entity/components/common/Table/table";
import { FluidPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/components/FluidPaper/fluidPaper";
import { StyledToolbar } from "../../../../components/Table/components/TableToolbar/tableToolbar.styles";
import { TablePlaceholder } from "../../../../components/Table/components/TablePlaceholder/tablePlaceholder";
import { ViewComponentAtlasSourceDatasetsSelection } from "../ViewComponentAtlasSourceDatasetsSelection/viewComponentAtlasSourceDatasetsSelection";

export const Table = (): JSX.Element => {
  const { access, table } = useIntegratedObjectSourceDatasetsTable();
  const { data, pathParameter } = useEntity() as Entity;
  const {
    atlasSourceDatasets = [],
    componentAtlas,
    integratedObjectSourceDatasets = [],
  } = data;
  return (
    <FluidPaper elevation={0}>
      <GridPaper>
        {access?.canEdit && (
          <StyledToolbar>
            <ViewComponentAtlasSourceDatasetsSelection
              componentAtlasIsArchived={componentAtlas?.isArchived ?? false}
              componentAtlasSourceDatasets={integratedObjectSourceDatasets}
              pathParameter={pathParameter}
              atlasSourceDatasets={atlasSourceDatasets}
            />
          </StyledToolbar>
        )}
        {table.getRowCount() > 0 && <CommonTable table={table} />}
        <TablePlaceholder
          message="No linked source datasets"
          rowCount={integratedObjectSourceDatasets.length}
        />
      </GridPaper>
    </FluidPaper>
  );
};
