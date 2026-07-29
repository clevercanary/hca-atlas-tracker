import { EditFileArchivedStatus } from "@/app/components/Entity/components/common/Table/components/TableFeatures/RowSelection/components/EditFileArchivedStatus/editFileArchivedStatus";
import { RowSelection } from "@/app/components/Entity/components/common/Table/components/TableFeatures/RowSelection/rowSelection";
import { ArchivedStatusToggle } from "@/app/components/Entity/components/common/Table/components/TableToolbar/components/ArchivedStatusToggle/archiveStatusToggle";
import { Table as CommonTable } from "@/app/components/Entity/components/common/Table/table";
import { StyledFluidPaper } from "@/app/components/Table/components/TablePaper/tablePaper.styles";
import { TablePlaceholder } from "@/app/components/Table/components/TablePlaceholder/tablePlaceholder";
import { ATLAS } from "@/app/hooks/useFetchAtlas";
import { INTEGRATED_OBJECTS } from "@/app/views/ComponentAtlasesView/hooks/useFetchComponentAtlases";
import { Fragment, JSX } from "react";
import { Divider } from "../TrackerForm/components/Divider/divider.styles";
import { useIntegratedObjectsTable } from "./hooks/UseIntegratedObjectsTable/hook";
import { StyledToolbar } from "./viewComponentAtlases.styles";

export const ViewComponentAtlases = (): JSX.Element => {
  const { access, table } = useIntegratedObjectsTable();
  const { canEdit = false } = access || {};

  return (
    <StyledFluidPaper elevation={0}>
      {canEdit && (
        <Fragment>
          <StyledToolbar>
            <RowSelection
              component={(props) =>
                EditFileArchivedStatus({
                  ...props,
                  fetchKeys: [ATLAS, INTEGRATED_OBJECTS],
                })
              }
              table={table}
            />
            <ArchivedStatusToggle fetchKeys={[INTEGRATED_OBJECTS]} />
          </StyledToolbar>
          <Divider />
        </Fragment>
      )}
      {table.getRowCount() > 0 && <CommonTable stickyHeader table={table} />}
      <TablePlaceholder
        message="No integrated objects"
        rowCount={table.getRowCount()}
      />
    </StyledFluidPaper>
  );
};
