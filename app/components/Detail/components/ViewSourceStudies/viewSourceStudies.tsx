import { COLLATOR_CASE_INSENSITIVE } from "@databiosphere/findable-ui/lib/common/constants";
import { AddIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/AddIcon/addIcon";
import { GridPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/paper.styles";
import { useMemo } from "react";
import {
  AtlasId,
  HCAAtlasTrackerSourceStudy,
} from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { getSourceStudyCitation } from "../../../../apis/catalog/hca-atlas-tracker/common/utils";
import { getRouteURL } from "../../../../common/utils";
import { FormManager } from "../../../../hooks/useFormManager/common/entities";
import { ROUTE } from "../../../../routes/constants";
import { getAtlasSourceStudiesTableColumns } from "../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { BUTTON_COLOR } from "../../../common/Button/components/ButtonLink/buttonLink";
import { RequestAccess } from "./components/RequestAccess/requestAccess";
import { ButtonLink, Paper, Table, Toolbar } from "./viewSourceStudies.styles";

interface ViewSourceStudiesProps {
  atlasId: AtlasId;
  formManager: FormManager;
  sourceStudies?: HCAAtlasTrackerSourceStudy[];
}

export const ViewSourceStudies = ({
  atlasId,
  formManager,
  sourceStudies = [],
}: ViewSourceStudiesProps): JSX.Element => {
  const {
    access: { canEdit, canView },
  } = formManager;
  const sortedSourceStudies = useMemo(
    () => sourceStudies.sort(sortSourceStudies),
    [sourceStudies]
  );
  if (!canView) return <RequestAccess />;
  return (
    <Paper>
      <GridPaper>
        {canEdit && (
          <Toolbar variant="table">
            <ButtonLink
              color={BUTTON_COLOR.SECONDARY}
              href={getRouteURL(ROUTE.CREATE_SOURCE_STUDY, atlasId)}
              startIcon={<AddIcon fontSize="small" />}
            >
              Add Source Study
            </ButtonLink>
          </Toolbar>
        )}
        {sourceStudies?.length > 0 && (
          <Table
            columns={getAtlasSourceStudiesTableColumns(atlasId)}
            gridTemplateColumns="minmax(260px, 1fr) minmax(152px, 0.5fr) 100px 110px 70px"
            items={sortedSourceStudies}
          />
        )}
      </GridPaper>
    </Paper>
  );
};

/**
 * Sorts source studies by citation, then title, ascending.
 * @param sd0 - First source study to compare.
 * @param sd1 - Second source study to compare.
 * @returns number indicating sort precedence of sd0 vs sd1.
 */
function sortSourceStudies(
  sd0: HCAAtlasTrackerSourceStudy,
  sd1: HCAAtlasTrackerSourceStudy
): number {
  const sortValue = COLLATOR_CASE_INSENSITIVE.compare(
    getSourceStudyCitation(sd0),
    getSourceStudyCitation(sd1)
  );
  if (sortValue === 0) {
    return COLLATOR_CASE_INSENSITIVE.compare(sd0.title ?? "", sd1.title ?? "");
  }
  return sortValue;
}
