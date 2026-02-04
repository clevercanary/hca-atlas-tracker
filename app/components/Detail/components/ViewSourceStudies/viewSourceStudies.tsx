import { COLLATOR_CASE_INSENSITIVE } from "@databiosphere/findable-ui/lib/common/constants";
import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/components/common/Button/constants";
import { AddIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/AddIcon/addIcon";
import { GridPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/paper.styles";
import { Table } from "@databiosphere/findable-ui/lib/components/Detail/components/Table/table";
import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { Button } from "@mui/material";
import Link from "next/link";
import { JSX, useMemo } from "react";
import {
  HCAAtlasTrackerSourceDataset,
  HCAAtlasTrackerSourceStudy,
} from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { getSourceStudyCitation } from "../../../../apis/catalog/hca-atlas-tracker/common/utils";
import { PathParameter } from "../../../../common/entities";
import { getRouteURL } from "../../../../common/utils";
import { FormManager } from "../../../../hooks/useFormManager/common/entities";
import { ROUTE } from "../../../../routes/constants";
import { getAtlasSourceStudiesTableColumns } from "../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { StyledFluidPaper } from "../../../Table/components/TablePaper/tablePaper.styles";
import { TablePlaceholder } from "../../../Table/components/TablePlaceholder/tablePlaceholder";
import { StyledToolbar } from "../../../Table/components/TableToolbar/tableToolbar.styles";
import { Alert } from "./components/Alert/alert";
import { RequestAccess } from "./components/RequestAccess/requestAccess";
import { TABLE_OPTIONS } from "./constants";
import { SubGrid } from "./viewAtlasSourceStudies.styles";

interface ViewSourceStudiesProps {
  atlasSourceDatasets?: HCAAtlasTrackerSourceDataset[];
  formManager: FormManager;
  pathParameter: PathParameter;
  sourceStudies?: HCAAtlasTrackerSourceStudy[];
  sourceStudiesSourceDatasets?: HCAAtlasTrackerSourceDataset[];
}

export const ViewSourceStudies = ({
  atlasSourceDatasets = [],
  formManager,
  pathParameter,
  sourceStudies = [],
  sourceStudiesSourceDatasets = [],
}: ViewSourceStudiesProps): JSX.Element => {
  const {
    access: { canEdit, canView },
  } = formManager;
  const sortedSourceStudies = useMemo(
    () => sourceStudies.sort(sortSourceStudies),
    [sourceStudies],
  );
  const atlasLinkedDatasetsByStudyId = useMemo(
    () =>
      sourceStudiesSourceDatasets.reduce((datasets, sourceDataset) => {
        if (sourceDataset.sourceStudyId === null) return datasets;
        const linkedDataset = atlasSourceDatasets.find(
          (atlasSourceDataset) => atlasSourceDataset.id === sourceDataset.id,
        );
        if (linkedDataset) {
          let studyDatasets = datasets.get(sourceDataset.sourceStudyId);
          if (!studyDatasets)
            datasets.set(sourceDataset.sourceStudyId, (studyDatasets = []));
          studyDatasets.push(sourceDataset);
        }
        return datasets;
      }, new Map<string, HCAAtlasTrackerSourceDataset[]>()),
    [atlasSourceDatasets, sourceStudiesSourceDatasets],
  );
  if (!canView) return <RequestAccess />;
  return (
    <SubGrid>
      {/* What is a Source Study? */}
      <Alert />
      <StyledFluidPaper elevation={0}>
        <GridPaper>
          {canEdit && (
            <StyledToolbar>
              <Button
                {...BUTTON_PROPS.SECONDARY_CONTAINED}
                component={Link}
                href={getRouteURL(ROUTE.CREATE_SOURCE_STUDY, pathParameter)}
                startIcon={
                  <AddIcon
                    color={SVG_ICON_PROPS.COLOR.INK_LIGHT}
                    fontSize={SVG_ICON_PROPS.FONT_SIZE.SMALL}
                  />
                }
              >
                Add Source Study
              </Button>
            </StyledToolbar>
          )}
          {sourceStudies.length > 0 && (
            <Table
              columns={getAtlasSourceStudiesTableColumns(
                pathParameter,
                atlasLinkedDatasetsByStudyId,
              )}
              gridTemplateColumns="max-content minmax(280px, 1.2fr) minmax(120px, 0.4fr) minmax(200px, 1fr) repeat(2, minmax(180px, 0.75fr))"
              items={sortedSourceStudies}
              tableOptions={TABLE_OPTIONS}
            />
          )}
          <TablePlaceholder
            canEdit={canEdit}
            message="No source studies"
            rowCount={sourceStudies.length}
          />
        </GridPaper>
      </StyledFluidPaper>
    </SubGrid>
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
  ss1: HCAAtlasTrackerSourceStudy,
): number {
  const sortValue = COLLATOR_CASE_INSENSITIVE.compare(
    getSourceStudyCitation(ss0),
    getSourceStudyCitation(ss1),
  );
  if (sortValue === 0) {
    return COLLATOR_CASE_INSENSITIVE.compare(ss0.title ?? "", ss1.title ?? "");
  }
  return sortValue;
}
