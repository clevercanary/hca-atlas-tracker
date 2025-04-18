import { COLLATOR_CASE_INSENSITIVE } from "@databiosphere/findable-ui/lib/common/constants";
import { AddIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/AddIcon/addIcon";
import { GridPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/paper.styles";
import { useMemo } from "react";
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
import {
  BUTTON_COLOR,
  ButtonLink,
} from "../../../common/Button/components/ButtonLink/buttonLink";
import { Paper } from "../../../Table/components/TablePaper/tablePaper.styles";
import { TablePlaceholder } from "../../../Table/components/TablePlaceholder/tablePlaceholder";
import { Toolbar } from "../../../Table/components/TableToolbar/tableToolbar.styles";
import { Table } from "../../../Table/table.styles";
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
    [sourceStudies]
  );
  const atlasLinkedDatasetsByStudyId = useMemo(
    () =>
      sourceStudiesSourceDatasets.reduce((datasets, sourceDataset) => {
        const linkedDataset = atlasSourceDatasets.find(
          (atlasSourceDataset) => atlasSourceDataset.id === sourceDataset.id
        );
        if (linkedDataset) {
          let studyDatasets = datasets.get(sourceDataset.sourceStudyId);
          if (!studyDatasets)
            datasets.set(sourceDataset.sourceStudyId, (studyDatasets = []));
          studyDatasets.push(sourceDataset);
        }
        return datasets;
      }, new Map<string, HCAAtlasTrackerSourceDataset[]>()),
    [atlasSourceDatasets, sourceStudiesSourceDatasets]
  );
  if (!canView) return <RequestAccess />;
  return (
    <SubGrid>
      {/* What is a Source Study? */}
      <Alert />
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
              columns={getAtlasSourceStudiesTableColumns(
                pathParameter,
                atlasLinkedDatasetsByStudyId
              )}
              gridTemplateColumns="max-content minmax(260px, 1fr) minmax(100px, 118px) minmax(80px, 130px) minmax(80px, 130px) minmax(170px, 190px) minmax(130px, 150px) minmax(170px, 185px)"
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
      </Paper>
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
