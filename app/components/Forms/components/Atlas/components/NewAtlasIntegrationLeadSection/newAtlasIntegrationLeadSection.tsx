import { HCAAtlasTrackerAtlas } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { SectionContentProps } from "@/app/components/Forms/common/entities";
import { IntegrationLeadSection } from "@/app/components/Forms/components/Atlas/components/IntegrationLeadSection/integrationLeadSection";
import { NewAtlasData } from "@/app/views/AddNewAtlasView/common/entities";
import { JSX } from "react";

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
