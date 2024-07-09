import { GridPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/paper.styles";
import { HCAAtlasTrackerSourceDataset } from "../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../../../../../../../../common/entities";
import { FormManager } from "../../../../../../../../../../hooks/useFormManager/common/entities";
import { Paper } from "../../../../../../../../../Table/components/TablePaper/tablePaper.styles";
import { TableSection } from "../../../../../../../../../Table/components/TableSection/tableSection";
import { Toolbar } from "../../../../../../../../../Table/components/TableToolbar/tableToolbar.styles";
import { ViewSourceStudiesSourceDatasets } from "../../../../../../../ViewSourceStudiesSourceDatasets/viewSourceStudiesSourceDatasets";
import { Section, SectionHero, SectionTitle } from "../../../../section.styles";
import { Table } from "./components/Table/table";

export interface LinkedSourceDatasetsProps {
  componentAtlasSourceDatasets: HCAAtlasTrackerSourceDataset[];
  formManager: FormManager;
  pathParameter: PathParameter;
  sourceStudiesSourceDatasets: HCAAtlasTrackerSourceDataset[];
}

export const LinkedSourceDatasets = ({
  componentAtlasSourceDatasets,
  formManager,
  pathParameter,
  sourceStudiesSourceDatasets,
}: LinkedSourceDatasetsProps): JSX.Element => {
  const {
    access: { canEdit },
  } = formManager;
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
                sourceStudiesSourceDatasets={sourceStudiesSourceDatasets}
              />
            </Toolbar>
          )}
          {componentAtlasSourceDatasets.length > 0 && (
            <Table
              canEdit={canEdit}
              componentAtlasSourceDatasets={componentAtlasSourceDatasets}
              pathParameter={pathParameter}
            />
          )}
          {!canEdit && componentAtlasSourceDatasets.length === 0 && (
            <TableSection>No linked source datasets</TableSection>
          )}
        </GridPaper>
      </Paper>
    </Section>
  );
};
