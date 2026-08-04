import { Divider } from "@/app/components/Detail/components/TrackerForm/components/Divider/divider.styles";
import { EditFileArchivedStatus } from "@/app/components/Entity/components/common/Table/components/TableFeatures/RowSelection/components/EditFileArchivedStatus/editFileArchivedStatus";
import { RowSelection } from "@/app/components/Entity/components/common/Table/components/TableFeatures/RowSelection/rowSelection";
import { ArchivedStatusToggle } from "@/app/components/Entity/components/common/Table/components/TableToolbar/components/ArchivedStatusToggle/archiveStatusToggle";
import { Table as CommonTable } from "@/app/components/Entity/components/common/Table/table";
import { StyledFluidPaper } from "@/app/components/Table/components/TablePaper/tablePaper.styles";
import { TablePlaceholder } from "@/app/components/Table/components/TablePlaceholder/tablePlaceholder";
import { ATLAS } from "@/app/hooks/UseFetchAtlas/query/constants";
import { useEntity } from "@/app/providers/entity/hook";
import { INTEGRATED_OBJECTS } from "@/app/views/ComponentAtlasesView/hooks/UseFetchComponentAtlases/query/constants";
import { Fragment, type JSX } from "react";
import { useIntegratedObjectsTable } from "./hooks/UseIntegratedObjectsTable/hook";
import { StyledToolbar } from "./viewComponentAtlases.styles";

export const ViewComponentAtlases = (): JSX.Element => {
  const { access, table } = useIntegratedObjectsTable();
  const { canEdit = false } = access || {};
  const { pathParameter } = useEntity();
  const { atlasId } = pathParameter || {};

  return (
    <StyledFluidPaper elevation={0}>
      {canEdit && (
        <Fragment>
          <StyledToolbar>
            <RowSelection
              component={(props) =>
                EditFileArchivedStatus({
                  ...props,
                  queryKeys: [
                    [ATLAS, atlasId],
                    [INTEGRATED_OBJECTS, atlasId],
                  ],
                })
              }
              table={table}
            />
            <ArchivedStatusToggle />
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
