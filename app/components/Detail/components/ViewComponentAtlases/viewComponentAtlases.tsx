import { GridPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/paper.styles";
import { Table } from "@databiosphere/findable-ui/lib/components/Detail/components/Table/table";
import { HCAAtlasTrackerComponentAtlas } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormManager } from "../../../../hooks/useFormManager/common/entities";
import { getAtlasComponentAtlasesTableColumns } from "../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { StyledFluidPaper } from "../../../Table/components/TablePaper/tablePaper.styles";
import { TablePlaceholder } from "../../../Table/components/TablePlaceholder/tablePlaceholder";
import { RequestAccess } from "./components/RequestAccess/requestAccess";
import { TABLE_OPTIONS } from "./constants";

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
  if (!canView) return <RequestAccess />;
  return (
    <StyledFluidPaper elevation={0}>
      <GridPaper>
        {componentAtlases.length > 0 && (
          <Table
            columns={getAtlasComponentAtlasesTableColumns()}
            gridTemplateColumns="max-content max-content repeat(9, minmax(136px, 1fr)) minmax(120px, 0.75fr)"
            items={componentAtlases}
            tableOptions={{
              ...TABLE_OPTIONS,
              meta: { canEdit },
            }}
          />
        )}
        <TablePlaceholder
          message="No integrated objects"
          rowCount={componentAtlases.length}
        />
      </GridPaper>
    </StyledFluidPaper>
  );
};
