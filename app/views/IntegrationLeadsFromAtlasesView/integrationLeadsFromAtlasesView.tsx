import { IntegrationLeadsFromAtlasesForm } from "@/app/components/Forms/components/IntegrationLeadsFromAtlases/integrationLeadsFromAtlases";
import { Content } from "@/app/components/Layout/components/Content/content";
import { LAYOUT_STYLE_NO_CONTRAST_DEFAULT } from "@/app/content/common/constants";
import { ContentView } from "@databiosphere/findable-ui/lib/views/ContentView/contentView";
import { type JSX } from "react";

export const IntegrationLeadsFromAtlasesView = (): JSX.Element => {
  return (
    <ContentView
      content={
        <Content>
          <h1>Update Integration Lead Users</h1>
          <IntegrationLeadsFromAtlasesForm />
        </Content>
      }
      layoutStyle={LAYOUT_STYLE_NO_CONTRAST_DEFAULT}
    />
  );
};
