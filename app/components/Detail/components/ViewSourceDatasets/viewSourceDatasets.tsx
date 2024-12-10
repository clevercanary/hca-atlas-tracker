import { COLLATOR_CASE_INSENSITIVE } from "@databiosphere/findable-ui/lib/common/constants";
import { GridPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/paper.styles";
import { HCAAtlasTrackerSourceDataset } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../../common/entities";
import { FormManager as FormManagerProps } from "../../../../hooks/useFormManager/common/entities";
import { getAtlasSourceStudySourceDatasetsTableColumns } from "../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { Paper } from "../../../Table/components/TablePaper/tablePaper.styles";
import { TablePlaceholder } from "../../../Table/components/TablePlaceholder/tablePlaceholder";
import { Toolbar } from "../../../Table/components/TableToolbar/tableToolbar.styles";
import { Table } from "../../../Table/table.styles";
import { AddSourceDataset } from "../AddSourceDataset/addSourceDataset";
import { RequestAccess } from "./components/RequestAccess/requestAccess";
import { TABLE_OPTIONS } from "./constants";

interface ViewSourceDatasetsProps {
  formManager: FormManagerProps;
  isCELLXGENECollection: boolean;
  pathParameter: PathParameter;
  sourceDatasets?: HCAAtlasTrackerSourceDataset[];
}

export const ViewSourceDatasets = ({
  formManager,
  isCELLXGENECollection,
  pathParameter,
  sourceDatasets = [],
}: ViewSourceDatasetsProps): JSX.Element => {
  const {
    access: { canEdit, canView },
  } = formManager;
  if (!canView) return <RequestAccess />;
  return (
    <Paper>
      <GridPaper>
        {canEdit && !isCELLXGENECollection && (
          <Toolbar variant="table">
            <AddSourceDataset pathParameter={pathParameter} />
          </Toolbar>
        )}
        {sourceDatasets.length > 0 && (
          <Table
            columns={getAtlasSourceStudySourceDatasetsTableColumns(
              pathParameter,
              canEdit
            )}
            gridTemplateColumns="max-content minmax(200px, 1fr) minmax(180px, auto) repeat(4, minmax(88px, 0.4fr)) auto"
            items={sourceDatasets.sort(sortSourceDataset)}
            tableOptions={TABLE_OPTIONS}
          />
        )}
        <TablePlaceholder
          canEdit={canEdit}
          message="No source datasets"
          rowCount={sourceDatasets.length}
        />
      </GridPaper>
    </Paper>
  );
};

/**
 * Sorts source dataset by title, ascending.
 * @param sd0 - First source dataset to compare.
 * @param sd1 - Second source dataset to compare.
 * @returns number indicating sort precedence of sd0 vs sd1.
 */
function sortSourceDataset(
  sd0: HCAAtlasTrackerSourceDataset,
  sd1: HCAAtlasTrackerSourceDataset
): number {
  return COLLATOR_CASE_INSENSITIVE.compare(sd0.title, sd1.title);
}
