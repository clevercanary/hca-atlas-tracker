import { Table as CommonTable } from "@/app/components/Entity/components/common/Table/table";
import { TablePlaceholder } from "@/app/components/Table/components/TablePlaceholder/tablePlaceholder";
import { StyledToolbar } from "@/app/components/Table/components/TableToolbar/tableToolbar.styles";
import { useEntity } from "@/app/providers/entity/hook";
import { Entity } from "@/app/views/IntegratedObjectSourceDatasetsView/entities";
import { Divider } from "@mui/material";
import { StyledFluidPaper } from "app/components/Table/components/TablePaper/tablePaper.styles";
import { Fragment, JSX } from "react";
import { ViewComponentAtlasSourceDatasetsSelection } from "../ViewComponentAtlasSourceDatasetsSelection/viewComponentAtlasSourceDatasetsSelection";
import { useIntegratedObjectSourceDatasetsTable } from "./hooks/UseIntegratedObjectSourceDatasetsTable/hook";

export const Table = (): JSX.Element => {
  const { access, table } = useIntegratedObjectSourceDatasetsTable();
  const { data, pathParameter } = useEntity() as Entity;
  const {
    atlasSourceDatasets = [],
    componentAtlas,
    integratedObjectSourceDatasets = [],
  } = data;
  return (
    <StyledFluidPaper elevation={0}>
      {access?.canEdit && (
        <Fragment>
          <StyledToolbar>
            <ViewComponentAtlasSourceDatasetsSelection
              componentAtlasIsArchived={componentAtlas?.isArchived ?? false}
              componentAtlasSourceDatasets={integratedObjectSourceDatasets}
              pathParameter={pathParameter}
              atlasSourceDatasets={atlasSourceDatasets}
            />
          </StyledToolbar>
          <Divider />
        </Fragment>
      )}
      {table.getRowCount() > 0 && <CommonTable stickyHeader table={table} />}
      <TablePlaceholder
        message="No linked source datasets"
        rowCount={table.getRowCount()}
      />
    </StyledFluidPaper>
  );
};
