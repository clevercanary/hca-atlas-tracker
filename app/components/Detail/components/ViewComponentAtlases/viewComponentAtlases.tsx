import { AddIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/AddIcon/addIcon";
import { GridPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/paper.styles";
import {
  AtlasId,
  HCAAtlasTrackerComponentAtlas,
} from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { getRouteURL } from "../../../../common/utils";
import { FormManager } from "../../../../hooks/useFormManager/common/entities";
import { ROUTE } from "../../../../routes/constants";
import { getAtlasComponentAtlasesTableColumns } from "../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { BUTTON_COLOR } from "../../../common/Button/components/ButtonLink/buttonLink";
import { RequestAccess } from "./components/RequestAccess/requestAccess";
import {
  ButtonLink,
  Paper,
  Table,
  Toolbar,
} from "./viewComponentAtlases.styles";

interface ViewComponentAtlasesProps {
  atlasId: AtlasId;
  componentAtlases?: HCAAtlasTrackerComponentAtlas[];
  formManager: FormManager;
}

export const ViewComponentAtlases = ({
  atlasId,
  componentAtlases = [],
  formManager,
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
              href={getRouteURL(ROUTE.CREATE_COMPONENT_ATLAS, atlasId)}
              startIcon={<AddIcon fontSize="small" />}
            >
              Add Component Atlas
            </ButtonLink>
          </Toolbar>
        )}
        {componentAtlases?.length > 0 && (
          <Table
            columns={getAtlasComponentAtlasesTableColumns(atlasId)}
            gridTemplateColumns="minmax(260px, 1fr)"
            items={componentAtlases}
          />
        )}
      </GridPaper>
    </Paper>
  );
};
