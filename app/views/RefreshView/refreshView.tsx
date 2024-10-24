import { useAuth } from "@databiosphere/findable-ui/lib/providers/authentication/auth/hook";
import { ContentView } from "@databiosphere/findable-ui/lib/views/ContentView/contentView";
import { AccessPrompt } from "../../components/common/Form/components/FormManager/components/AccessPrompt/accessPrompt";
import { Divider } from "../../components/Detail/components/TrackerForm/components/Divider/divider.styles";
import { RefreshForm } from "../../components/Forms/components/Refresh/refresh";
import { Content } from "../../components/Layout/components/Content/content";
import { LAYOUT_STYLE_NO_CONTRAST_DEFAULT } from "../../content/common/constants";

export const RefreshView = (): JSX.Element => {
  const {
    authState: { isAuthenticated },
  } = useAuth();
  return (
    <ContentView
      content={
        <Content>
          <h1>Refresh External Entities</h1>
          {isAuthenticated ? (
            <RefreshForm />
          ) : (
            <AccessPrompt
              divider={<Divider />}
              text="to access refresh controls"
            />
          )}
        </Content>
      }
      layoutStyle={LAYOUT_STYLE_NO_CONTRAST_DEFAULT}
    />
  );
};
