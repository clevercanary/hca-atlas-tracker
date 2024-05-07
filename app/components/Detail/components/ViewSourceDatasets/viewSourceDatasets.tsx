import { AddIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/AddIcon/addIcon";
import { GridPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/paper.styles";
import {
  AtlasId,
  HCAAtlasTrackerSourceDataset,
} from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { getRouteURL } from "../../../../common/utils";
import { FormManager } from "../../../../hooks/useFormManager/common/entities";
import { ROUTE } from "../../../../routes/constants";
import { getAtlasSourceDatasetsTableColumns } from "../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import {
  ButtonLink,
  BUTTON_COLOR,
} from "../../../common/Button/components/ButtonLink/buttonLink";
import { RequestAccess } from "./components/RequestAccess/requestAccess";
import { Paper, Table, TableToolbar } from "./viewSourceDatasets.styles";

interface ViewSourceDatasetsProps {
  atlasId: AtlasId;
  formManager: FormManager;
  sourceDatasets?: HCAAtlasTrackerSourceDataset[];
}

export const ViewSourceDatasets = ({
  atlasId,
  formManager,
  sourceDatasets = [],
}: ViewSourceDatasetsProps): JSX.Element => {
  const {
    access: { canEdit, canView },
  } = formManager;
  if (!canView) return <RequestAccess />;
  return (
    <Paper>
      <GridPaper>
        {canEdit && (
          <TableToolbar>
            <ButtonLink
              color={BUTTON_COLOR.SECONDARY}
              href={getRouteURL(ROUTE.CREATE_SOURCE_DATASET, atlasId)}
              startIcon={<AddIcon fontSize="small" />}
            >
              Add Source Dataset
            </ButtonLink>
          </TableToolbar>
        )}
        {sourceDatasets?.length > 0 && (
          <Table
            columns={getAtlasSourceDatasetsTableColumns(atlasId)}
            gridTemplateColumns="minmax(260px, 1fr) minmax(152px, 0.5fr) 100px 110px 70px"
            items={sourceDatasets}
          />
        )}
      </GridPaper>
    </Paper>
  );
};
