import { COLLATOR_CASE_INSENSITIVE } from "@databiosphere/findable-ui/lib/common/constants";
import { AddIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/AddIcon/addIcon";
import { GridPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/paper.styles";
import { useMemo } from "react";
import { HCAAtlasTrackerSourceStudy } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { getSourceStudyCitation } from "../../../../apis/catalog/hca-atlas-tracker/common/utils";
import { PathParameter } from "../../../../common/entities";
import { getRouteURL } from "../../../../common/utils";
import { FormManager } from "../../../../hooks/useFormManager/common/entities";
import { ROUTE } from "../../../../routes/constants";
import { getAtlasSourceStudiesTableColumns } from "../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import {
  ButtonLink,
  BUTTON_COLOR,
} from "../../../common/Button/components/ButtonLink/buttonLink";
import { Paper } from "../../../Table/components/TablePaper/tablePaper.styles";
import { TableSection } from "../../../Table/components/TableSection/tableSection";
import { Toolbar } from "../../../Table/components/TableToolbar/tableToolbar.styles";
import { Table } from "../../../Table/table.styles";
import { RequestAccess } from "./components/RequestAccess/requestAccess";

interface ViewSourceStudiesProps {
  formManager: FormManager;
  pathParameter: PathParameter;
  sourceStudies?: HCAAtlasTrackerSourceStudy[];
}

export const ViewSourceStudies = ({
  formManager,
  pathParameter,
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
              href={getRouteURL(ROUTE.CREATE_SOURCE_STUDY, pathParameter)}
              startIcon={<AddIcon color="inkLight" fontSize="small" />}
            >
              Add Source Study
            </ButtonLink>
          </Toolbar>
        )}
        {sourceStudies.length > 0 && (
          <Table
            columns={getAtlasSourceStudiesTableColumns(pathParameter)}
            gridTemplateColumns="minmax(260px, 1fr) minmax(152px, 0.5fr) minmax(80px, 130px) repeat(3, minmax(100px, 118px))"
            items={sortedSourceStudies}
          />
        )}
        {!canEdit && sourceStudies.length === 0 && (
          <TableSection>No source studies</TableSection>
        )}
      </GridPaper>
    </Paper>
  );
};

/**
 * Sorts source studies by citation, then title, ascending.
 * @param ss0 - First source study to compare.
 * @param ss1 - Second source study to compare.
 * @returns number indicating sort precedence of ss0 vs ss1.
 */
function sortSourceStudies(
  ss0: HCAAtlasTrackerSourceStudy,
  ss1: HCAAtlasTrackerSourceStudy
): number {
  const sortValue = COLLATOR_CASE_INSENSITIVE.compare(
    getSourceStudyCitation(ss0),
    getSourceStudyCitation(ss1)
  );
  if (sortValue === 0) {
    return COLLATOR_CASE_INSENSITIVE.compare(ss0.title ?? "", ss1.title ?? "");
  }
  return sortValue;
}
