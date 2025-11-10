import { GridPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/paper.styles";
import { HCAAtlasTrackerSourceDataset } from "../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../../../../../../../../common/entities";
import { FormManager } from "../../../../../../../../../../hooks/useFormManager/common/entities";
import { StyledFluidPaper } from "../../../../../../../../../Table/components/TablePaper/tablePaper.styles";
import { TablePlaceholder } from "../../../../../../../../../Table/components/TablePlaceholder/tablePlaceholder";
import { StyledToolbar } from "../../../../../../../../../Table/components/TableToolbar/tableToolbar.styles";
import { ViewComponentAtlasSourceDatasetsSelection } from "../../../../../../../ViewComponentAtlasSourceDatasetsSelection/viewComponentAtlasSourceDatasetsSelection";
import { Section, SectionHero, SectionTitle } from "../../../../section.styles";
import { Table } from "./components/Table/table";

export interface LinkedSourceDatasetsProps {
  atlasSourceDatasets: HCAAtlasTrackerSourceDataset[];
  componentAtlasSourceDatasets: HCAAtlasTrackerSourceDataset[];
  formManager: FormManager;
  pathParameter: PathParameter;
}

export const LinkedSourceDatasets = ({
  atlasSourceDatasets,
  componentAtlasSourceDatasets,
  formManager,
  pathParameter,
}: LinkedSourceDatasetsProps): JSX.Element => {
  const {
    access: { canEdit },
  } = formManager;
  return (
    <Section>
      <SectionHero fullWidth>
        <SectionTitle>Linked source datasets</SectionTitle>
      </SectionHero>
      <StyledFluidPaper elevation={0}>
        <GridPaper>
          {canEdit && (
            <StyledToolbar>
              <ViewComponentAtlasSourceDatasetsSelection
                componentAtlasSourceDatasets={componentAtlasSourceDatasets}
                pathParameter={pathParameter}
                atlasSourceDatasets={atlasSourceDatasets}
              />
            </StyledToolbar>
          )}
          {componentAtlasSourceDatasets.length > 0 && (
            <Table
              canEdit={canEdit}
              componentAtlasSourceDatasets={componentAtlasSourceDatasets}
              pathParameter={pathParameter}
            />
          )}
          <TablePlaceholder
            canEdit={canEdit}
            message="No linked source datasets"
            rowCount={componentAtlasSourceDatasets.length}
          />
        </GridPaper>
      </StyledFluidPaper>
    </Section>
  );
};
