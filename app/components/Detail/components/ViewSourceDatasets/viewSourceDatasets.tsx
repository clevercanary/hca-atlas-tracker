import { COLLATOR_CASE_INSENSITIVE } from "@databiosphere/findable-ui/lib/common/constants";
import { GridPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/paper.styles";
import { HCAAtlasTrackerSourceDataset } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../../common/entities";
import { FormManager as FormManagerProps } from "../../../../hooks/useFormManager/common/entities";
import { getAtlasSourceDatasetsTableColumns } from "../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { TypographyTextBody400 } from "../../../common/Typography/components/TypographyTextBody400/typographyTextBody400";
import { Paper } from "../../../Table/components/TablePaper/tablePaper.styles";
import { Toolbar } from "../../../Table/components/TableToolbar/tableToolbar.styles";
import { Table } from "../../../Table/table.styles";
import { AddSourceDataset } from "../AddSourceDataset/addSourceDataset";
import { RequestAccess } from "./components/RequestAccess/requestAccess";
import { GridPaperSection } from "./viewSourceDatasets.styles";

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
  const isSourceDatasets = sourceDatasets?.length > 0;
  return (
    <Paper>
      <GridPaper>
        {canEdit && !isCELLXGENECollection && (
          <Toolbar variant="table">
            <AddSourceDataset pathParameter={pathParameter} />
          </Toolbar>
        )}
        {isSourceDatasets && (
          <Table
            columns={getAtlasSourceDatasetsTableColumns(pathParameter)}
            gridTemplateColumns="minmax(200px, 1fr) minmax(180px, auto) repeat(3, minmax(88px, 0.4fr)) auto"
            items={sourceDatasets.sort(sortSourceDataset)}
          />
        )}
        {!isSourceDatasets && isCELLXGENECollection && (
          <GridPaperSection>
            <TypographyTextBody400>No source datasets</TypographyTextBody400>
          </GridPaperSection>
        )}
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
