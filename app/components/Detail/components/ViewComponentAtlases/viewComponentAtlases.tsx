import { AddIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/AddIcon/addIcon";
import { GridPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/paper.styles";
import { HCAAtlasTrackerComponentAtlas } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../../common/entities";
import { getRouteURL } from "../../../../common/utils";
import { FormManager } from "../../../../hooks/useFormManager/common/entities";
import { ROUTE } from "../../../../routes/constants";
import { getAtlasComponentAtlasesTableColumns } from "../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import {
  ButtonLink,
  BUTTON_COLOR,
} from "../../../common/Button/components/ButtonLink/buttonLink";
import { Paper } from "../../../Table/components/TablePaper/tablePaper.styles";
import { TableSection } from "../../../Table/components/TableSection/tableSection";
import { Toolbar } from "../../../Table/components/TableToolbar/tableToolbar.styles";
import { Table } from "../../../Table/table.styles";
import { RequestAccess } from "./components/RequestAccess/requestAccess";

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
    <Paper>
      <GridPaper>
        {canEdit && (
          <Toolbar variant="table">
            <ButtonLink
              color={BUTTON_COLOR.SECONDARY}
              href={getRouteURL(ROUTE.CREATE_COMPONENT_ATLAS, pathParameter)}
              startIcon={<AddIcon color="inkLight" fontSize="small" />}
            >
              Add Integration Object
            </ButtonLink>
          </Toolbar>
        )}
        {componentAtlases.length > 0 && (
          <Table
            columns={getAtlasComponentAtlasesTableColumns(pathParameter)}
            gridTemplateColumns="minmax(260px, 1fr) repeat(5, minmax(88px, 128px)) auto"
            items={componentAtlases}
          />
        )}
        {componentAtlases.length === 0 && (
          <TableSection>No integration objects</TableSection>
        )}
      </GridPaper>
    </Paper>
  );
};
