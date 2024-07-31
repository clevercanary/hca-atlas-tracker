import { ContentView } from "@databiosphere/findable-ui/lib/views/ContentView/contentView";
import { AccessPrompt } from "../../../app/components/common/Form/components/FormManager/components/AccessPrompt/accessPrompt";
import { Divider } from "../../../app/components/Detail/components/TrackerForm/components/Divider/divider.styles";
import { IntegrationLeadsFromAtlasesForm } from "../../../app/components/Forms/components/IntegrationLeadsFromAtlases/integrationLeadsFromAtlases";
import { Content } from "../../../app/components/Layout/components/Content/content";
import { LAYOUT_STYLE_NO_CONTRAST_DEFAULT } from "../../../app/content/common/constants";
import { useNextAuth } from "../../../app/hooks/useNextAuth";

export const IntegrationLeadsFromAtlasesView = (): JSX.Element => {
  const { isAuthenticated } = useNextAuth();
  return (
    <ContentView
      content={
        <Content>
          <h1>Update Integration Lead Users</h1>
          {isAuthenticated ? (
            <IntegrationLeadsFromAtlasesForm />
          ) : (
            <AccessPrompt divider={<Divider />} text="to update users" />
          )}
        </Content>
      }
      layoutStyle={LAYOUT_STYLE_NO_CONTRAST_DEFAULT}
    />
  );
};
