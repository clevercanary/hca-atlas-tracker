import { GridPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/paper.styles";
import { HCAAtlasTrackerSourceDataset } from "../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../../../../../../../../common/entities";
import { FormManager } from "../../../../../../../../../../hooks/useFormManager/common/entities";
import { getAtlasComponentSourceDatasetsTableColumns } from "../../../../../../../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { Paper } from "../../../../../../../../../Table/components/TablePaper/tablePaper.styles";
import { Toolbar } from "../../../../../../../../../Table/components/TableToolbar/tableToolbar.styles";
import { Table } from "../../../../../../../../../Table/table.styles";
import { ViewSourceStudiesSourceDatasets } from "../../../../../../../ViewSourceStudiesSourceDatasets/viewSourceStudiesSourceDatasets";
import { Section, SectionHero, SectionTitle } from "../../../../section.styles";

export interface LinkedSourceDatasetsProps {
  componentAtlasSourceDatasets: HCAAtlasTrackerSourceDataset[];
  formManager: FormManager;
  pathParameter: PathParameter;
}

export const LinkedSourceDatasets = ({
  componentAtlasSourceDatasets,
  formManager,
  pathParameter,
}: LinkedSourceDatasetsProps): JSX.Element => {
  const { access: canEdit } = formManager;
  return (
    <Section>
      <SectionHero fullWidth>
        <SectionTitle>Linked source datasets</SectionTitle>
      </SectionHero>
      <Paper>
        <GridPaper>
          {canEdit && (
            <Toolbar variant="table">
              <ViewSourceStudiesSourceDatasets
                componentAtlasSourceDatasets={componentAtlasSourceDatasets}
                pathParameter={pathParameter}
              />
            </Toolbar>
          )}
          {componentAtlasSourceDatasets.length > 0 && (
            <Table
              columns={getAtlasComponentSourceDatasetsTableColumns()}
              gridTemplateColumns="minmax(260px, 1fr)"
              items={componentAtlasSourceDatasets}
            />
          )}
        </GridPaper>
      </Paper>
    </Section>
  );
};
