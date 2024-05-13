import { COLLATOR_CASE_INSENSITIVE } from "@databiosphere/findable-ui/lib/common/constants";
import { AddIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/AddIcon/addIcon";
import { GridPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/paper.styles";
import { useMemo } from "react";
import {
  AtlasId,
  HCAAtlasTrackerSourceDataset,
} from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { getSourceDatasetCitation } from "../../../../apis/catalog/hca-atlas-tracker/common/utils";
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
  const sortedSourceDatasets = useMemo(
    () => sourceDatasets.sort(sortSourceDatasets),
    [sourceDatasets]
  );
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
            items={sortedSourceDatasets}
          />
        )}
      </GridPaper>
    </Paper>
  );
};

/**
 * Sorts source datasets by citation, then title, ascending.
 * @param sd0 - First source dataset to compare.
 * @param sd1 - Second source dataset to compare.
 * @returns number indicating sort precedence of sd0 vs sd1.
 */
function sortSourceDatasets(
  sd0: HCAAtlasTrackerSourceDataset,
  sd1: HCAAtlasTrackerSourceDataset
): number {
  const sortValue = COLLATOR_CASE_INSENSITIVE.compare(
    getSourceDatasetCitation(sd0),
    getSourceDatasetCitation(sd1)
  );
  if (sortValue === 0) {
    return COLLATOR_CASE_INSENSITIVE.compare(sd0.title ?? "", sd1.title ?? "");
  }
  return sortValue;
}
