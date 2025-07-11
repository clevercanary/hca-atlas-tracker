import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/components/common/Button/constants";
import { AddIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/AddIcon/addIcon";
import { GridPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/paper.styles";
import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { Button } from "@mui/material";
import Link from "next/link";
import { HCAAtlasTrackerComponentAtlas } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../../common/entities";
import { getRouteURL } from "../../../../common/utils";
import { FormManager } from "../../../../hooks/useFormManager/common/entities";
import { ROUTE } from "../../../../routes/constants";
import { getAtlasComponentAtlasesTableColumns } from "../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { StyledFluidPaper } from "../../../Table/components/TablePaper/tablePaper.styles";
import { TablePlaceholder } from "../../../Table/components/TablePlaceholder/tablePlaceholder";
import { StyledToolbar } from "../../../Table/components/TableToolbar/tableToolbar.styles";
import { Table } from "../../../Table/table.styles";
import { RequestAccess } from "./components/RequestAccess/requestAccess";
import { TABLE_OPTIONS } from "./constants";

interface ViewComponentAtlasesProps {
  componentAtlases?: HCAAtlasTrackerComponentAtlas[];
  formManager: FormManager;
  pathParameter: PathParameter;
}

export const ViewComponentAtlases = ({
  componentAtlases = [],
  formManager,
  pathParameter,
}: ViewComponentAtlasesProps): JSX.Element => {
  const {
    access: { canEdit, canView },
  } = formManager;
  if (!canView) return <RequestAccess />;
  return (
    <StyledFluidPaper elevation={0}>
      <GridPaper>
        {canEdit && (
          <StyledToolbar>
            <Button
              {...BUTTON_PROPS.SECONDARY_CONTAINED}
              component={Link}
              href={getRouteURL(ROUTE.CREATE_COMPONENT_ATLAS, pathParameter)}
              startIcon={
                <AddIcon
                  color={SVG_ICON_PROPS.COLOR.INK_LIGHT}
                  fontSize={SVG_ICON_PROPS.FONT_SIZE.SMALL}
                />
              }
            >
              Add Integration Object
            </Button>
          </StyledToolbar>
        )}
        {componentAtlases.length > 0 && (
          <Table
            columns={getAtlasComponentAtlasesTableColumns(pathParameter)}
            gridTemplateColumns="max-content minmax(260px, 1fr) repeat(5, minmax(88px, 128px)) auto"
            items={componentAtlases}
            tableOptions={TABLE_OPTIONS}
          />
        )}
        <TablePlaceholder
          canEdit={canEdit}
          message="No integration objects"
          rowCount={componentAtlases.length}
        />
      </GridPaper>
    </StyledFluidPaper>
  );
};
