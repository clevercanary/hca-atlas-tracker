import { Fragment, JSX } from "react";
import { EditFileArchivedStatus } from "../../../../components/Entity/components/common/Table/components/TableFeatures/RowSelection/components/EditFileArchivedStatus/editFileArchivedStatus";
import { RowSelection } from "../../../../components/Entity/components/common/Table/components/TableFeatures/RowSelection/rowSelection";
import { ArchivedStatusToggle } from "../../../../components/Entity/components/common/Table/components/TableToolbar/components/ArchivedStatusToggle/archiveStatusToggle";
import { Table as CommonTable } from "../../../../components/Entity/components/common/Table/table";
import { ATLAS } from "../../../../hooks/useFetchAtlas";
import { INTEGRATED_OBJECTS } from "../../../../views/ComponentAtlasesView/hooks/useFetchComponentAtlases";
import { StyledFluidPaper } from "../../../Table/components/TablePaper/tablePaper.styles";
import { TablePlaceholder } from "../../../Table/components/TablePlaceholder/tablePlaceholder";
import { Divider } from "../TrackerForm/components/Divider/divider.styles";
import { RequestAccess } from "./components/RequestAccess/requestAccess";
import { useIntegratedObjectsTable } from "./hooks/UseIntegratedObjectsTable/hook";
import { StyledToolbar } from "./viewComponentAtlases.styles";

export const ViewComponentAtlases = (): JSX.Element => {
  const { access, table } = useIntegratedObjectsTable();
  const { canEdit = false, canView = false } = access || {};

  if (!canView) return <RequestAccess />;

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
