import { HCAAtlasTrackerAtlas } from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { NewAtlasData } from "../../../../../../views/AddNewAtlasView/common/entities";
import { SectionContentProps } from "../../../../../Forms/common/entities";
import { IntegrationLeadSection } from "../IntegrationLeadSection/integrationLeadSection";

export const NewAtlasIntegrationLeadSection = ({
  formManager,
  formMethod,
  fullWidth,
}: SectionContentProps<NewAtlasData, HCAAtlasTrackerAtlas>): JSX.Element => {
  return (
    <IntegrationLeadSection
      formManager={formManager}
      formMethod={formMethod}
      fullWidth={fullWidth}
      getEmailName={(i) => `integrationLead.${i}.email`}
      getNameName={(i) => `integrationLead.${i}.name`}
      getNewValue={() => ({ email: "", name: "" })}
      integrationLeadName="integrationLead"
    />
  );
};
