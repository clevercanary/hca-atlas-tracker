import { HCAAtlasTrackerAtlas } from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { AtlasEditData } from "../../../../../../views/AtlasView/common/entities";
import { SectionContentProps } from "../../../../../Forms/common/entities";
import { IntegrationLeadSection } from "../IntegrationLeadSection/integrationLeadSection";

export const ViewAtlasIntegrationLeadSection = ({
  formManager,
  formMethod,
  fullWidth,
}: SectionContentProps<AtlasEditData, HCAAtlasTrackerAtlas>): JSX.Element => {
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
