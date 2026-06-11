import { ContentView } from "@databiosphere/findable-ui/lib/views/ContentView/contentView";
import { JSX } from "react";
import { IntegrationLeadsFromAtlasesForm } from "../../components/Forms/components/IntegrationLeadsFromAtlases/integrationLeadsFromAtlases";
import { Content } from "../../components/Layout/components/Content/content";
import { LAYOUT_STYLE_NO_CONTRAST_DEFAULT } from "../../content/common/constants";

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
