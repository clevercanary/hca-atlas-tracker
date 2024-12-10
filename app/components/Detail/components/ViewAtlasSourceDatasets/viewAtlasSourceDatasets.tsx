import { COLLATOR_CASE_INSENSITIVE } from "@databiosphere/findable-ui/lib/common/constants";
import { GridPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/paper.styles";
import { HCAAtlasTrackerSourceDataset } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../../common/entities";
import { FormManager as FormManagerProps } from "../../../../hooks/useFormManager/common/entities";
import { getAtlasSourceDatasetsTableColumns } from "../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { useSetLinkedAtlasSourceDatasets } from "../../../../views/AtlasSourceDatasetsView/hooks/useSetLinkedAtlasSourceDatasets";
import { Paper } from "../../../Table/components/TablePaper/tablePaper.styles";
import { TablePlaceholder } from "../../../Table/components/TablePlaceholder/tablePlaceholder";
import { Table } from "../../../Table/table.styles";
import { RequestAccess } from "./components/RequestAccess/requestAccess";
import { TABLE_OPTIONS } from "./constants";

interface ViewSourceDatasetsProps {
  atlasSourceDatasets?: HCAAtlasTrackerSourceDataset[];
  formManager: FormManagerProps;
  pathParameter: PathParameter;
  sourceStudiesSourceDatasets?: HCAAtlasTrackerSourceDataset[];
}

export const ViewAtlasSourceDatasets = ({
  atlasSourceDatasets = [],
  formManager,
  pathParameter,
  sourceStudiesSourceDatasets = [],
}: ViewSourceDatasetsProps): JSX.Element => {
  const linkedSourceDatasetIds = new Set(atlasSourceDatasets.map((d) => d.id));
  const {
    access: { canEdit, canView },
  } = formManager;
  const { onSetLinked } = useSetLinkedAtlasSourceDatasets(pathParameter);
  if (!canView) return <RequestAccess />;
  return (
    <Paper>
      <GridPaper>
        {sourceStudiesSourceDatasets.length > 0 && (
          <Table
            columns={getAtlasSourceDatasetsTableColumns(
              onSetLinked,
              canEdit,
              linkedSourceDatasetIds
            )}
            gridTemplateColumns="auto auto auto" // TODO
            items={sourceStudiesSourceDatasets.sort(sortSourceDataset)}
            tableOptions={TABLE_OPTIONS}
          />
        )}
        <TablePlaceholder
          canEdit={canEdit}
          message="No source datasets"
          rowCount={sourceStudiesSourceDatasets.length}
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
