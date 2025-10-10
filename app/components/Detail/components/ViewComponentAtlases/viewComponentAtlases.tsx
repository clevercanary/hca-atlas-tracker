import { GridPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/paper.styles";
import { useReactTable } from "@tanstack/react-table";
import { HCAAtlasTrackerComponentAtlas } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { ArchivedStatusToggle } from "../../../../components/Entity/components/common/Table/components/TableToolbar/components/ArchivedStatusToggle/archiveStatusToggle";
import { Table as CommonTable } from "../../../../components/Entity/components/common/Table/table";
import { CORE_OPTIONS } from "../../../../components/Table/options/core/constants";
import { FormManager } from "../../../../hooks/useFormManager/common/entities";
import { getAtlasComponentAtlasesTableColumns } from "../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { StyledFluidPaper } from "../../../Table/components/TablePaper/tablePaper.styles";
import { TablePlaceholder } from "../../../Table/components/TablePlaceholder/tablePlaceholder";
import { RequestAccess } from "./components/RequestAccess/requestAccess";
import { TABLE_OPTIONS } from "./constants";
import { StyledToolbar } from "./viewComponentAtlases.styles";
interface ViewComponentAtlasesProps {
  componentAtlases?: HCAAtlasTrackerComponentAtlas[];
  formManager: FormManager;
}

export const ViewComponentAtlases = ({
  componentAtlases = [],
  formManager,
}: ViewComponentAtlasesProps): JSX.Element => {
  const {
    access: { canEdit, canView },
  } = formManager;

  // Create table instance.
  const table = useReactTable({
    columns: getAtlasComponentAtlasesTableColumns(),
    data: componentAtlases,
    ...CORE_OPTIONS,
    ...TABLE_OPTIONS,
    meta: { canEdit },
  });

  if (!canView) return <RequestAccess />;

  return (
    <StyledFluidPaper elevation={0}>
      <GridPaper>
        <StyledToolbar>
          <ArchivedStatusToggle />
        </StyledToolbar>
        {table.getRowCount() > 0 && <CommonTable table={table} />}
        <TablePlaceholder
          message="No integrated objects"
          rowCount={componentAtlases.length}
        />
      </GridPaper>
    </StyledFluidPaper>
  );
};
