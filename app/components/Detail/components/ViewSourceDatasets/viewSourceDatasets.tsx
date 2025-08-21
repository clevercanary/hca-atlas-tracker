import { COLLATOR_CASE_INSENSITIVE } from "@databiosphere/findable-ui/lib/common/constants";
import { GridPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/paper.styles";
import { Table } from "@databiosphere/findable-ui/lib/components/Detail/components/Table/table";
import { HCAAtlasTrackerSourceDataset } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../../common/entities";
import { FormManager as FormManagerProps } from "../../../../hooks/useFormManager/common/entities";
import { getAtlasSourceStudySourceDatasetsTableColumns } from "../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { useSetLinkedAtlasSourceDatasets } from "../../../../views/SourceDatasetsView/hooks/useSetLinkedAtlasSourceDatasets";
import { StyledFluidPaper } from "../../../Table/components/TablePaper/tablePaper.styles";
import { TablePlaceholder } from "../../../Table/components/TablePlaceholder/tablePlaceholder";
import { RequestAccess } from "./components/RequestAccess/requestAccess";
import { TABLE_OPTIONS } from "./constants";

interface ViewSourceDatasetsProps {
  atlasSourceDatasets?: HCAAtlasTrackerSourceDataset[];
  formManager: FormManagerProps;
  pathParameter: PathParameter;
  sourceDatasets?: HCAAtlasTrackerSourceDataset[];
}

export const ViewSourceDatasets = ({
  atlasSourceDatasets = [],
  formManager,
  pathParameter,
  sourceDatasets = [],
}: ViewSourceDatasetsProps): JSX.Element => {
  const {
    access: { canEdit, canView },
  } = formManager;
  const { onSetLinked } = useSetLinkedAtlasSourceDatasets(pathParameter);
  if (!canView) return <RequestAccess />;
  const linkedSourceDatasetIds = new Set(atlasSourceDatasets.map((d) => d.id));
  return (
    <StyledFluidPaper elevation={0}>
      <GridPaper>
        {sourceDatasets.length > 0 && (
          <Table
            columns={getAtlasSourceStudySourceDatasetsTableColumns(
              pathParameter,
              onSetLinked,
              canEdit,
              linkedSourceDatasetIds
            )}
            gridTemplateColumns="max-content minmax(140px, 140px) minmax(300px, 2fr) repeat(7, minmax(180px, 1fr)) minmax(180px, .5fr)"
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
    </StyledFluidPaper>
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
