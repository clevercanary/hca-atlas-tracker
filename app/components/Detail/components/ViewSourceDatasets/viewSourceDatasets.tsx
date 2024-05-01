import { AddIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/AddIcon/addIcon";
import { GridPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/paper.styles";
import { Table } from "@databiosphere/findable-ui/lib/components/Detail/components/Table/table";
import {
  AtlasId,
  HCAAtlasTrackerSourceDataset,
} from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { getRouteURL } from "../../../../common/utils";
import { ROUTE } from "../../../../routes/constants";
import { getAtlasSourceDatasetsTableColumns } from "../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import {
  ButtonLink,
  BUTTON_COLOR,
} from "../../../common/Button/components/ButtonLink/buttonLink";
import { RequestAccess } from "./components/RequestAccess/requestAccess";
import { Paper, TableToolbar } from "./viewSourceDatasets.styles";

interface ViewSourceDatasetsProps {
  atlasId: AtlasId;
  isAuthenticated: boolean;
  sourceDatasets?: HCAAtlasTrackerSourceDataset[];
}

export const ViewSourceDatasets = ({
  atlasId,
  isAuthenticated,
  sourceDatasets = [],
}: ViewSourceDatasetsProps): JSX.Element => {
  if (!isAuthenticated) return <RequestAccess />;
  return (
    <Paper>
      <GridPaper>
        <TableToolbar>
          <ButtonLink
            color={BUTTON_COLOR.SECONDARY}
            href={getRouteURL(ROUTE.CREATE_ATLAS_SOURCE_DATASET, atlasId)}
            startIcon={<AddIcon fontSize="small" />}
          >
            Add Source Dataset
          </ButtonLink>
        </TableToolbar>
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
