import { COLLATOR_CASE_INSENSITIVE } from "@databiosphere/findable-ui/lib/common/constants";
import { GridPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/paper.styles";
import { Table } from "@databiosphere/findable-ui/lib/components/Detail/components/Table/table";
import { HCAAtlasTrackerSourceDataset } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormManager as FormManagerProps } from "../../../../hooks/useFormManager/common/entities";
import { getAtlasSourceStudySourceDatasetsTableColumns } from "../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { StyledFluidPaper } from "../../../Table/components/TablePaper/tablePaper.styles";
import { TablePlaceholder } from "../../../Table/components/TablePlaceholder/tablePlaceholder";
import { RequestAccess } from "./components/RequestAccess/requestAccess";
import { TABLE_OPTIONS } from "./constants";

interface ViewSourceDatasetsProps {
  formManager: FormManagerProps;
  sourceDatasets?: HCAAtlasTrackerSourceDataset[];
}

export const ViewSourceDatasets = ({
  formManager,
  sourceDatasets = [],
}: ViewSourceDatasetsProps): JSX.Element => {
  const {
    access: { canView },
  } = formManager;
  if (!canView) return <RequestAccess />;
  return (
    <StyledFluidPaper elevation={0}>
      <GridPaper>
        {sourceDatasets.length > 0 && (
          <Table
            columns={getAtlasSourceStudySourceDatasetsTableColumns()}
            gridTemplateColumns="max-content max-content minmax(240px, 1.6fr) repeat(4, minmax(128px, 1fr)) minmax(124px, .75fr)"
            items={sourceDatasets.sort(sortSourceDataset)}
            tableOptions={TABLE_OPTIONS}
          />
        )}
        <TablePlaceholder
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
  sd1: HCAAtlasTrackerSourceDataset,
): number {
  return COLLATOR_CASE_INSENSITIVE.compare(sd0.title, sd1.title);
}
