import { useAuthentication } from "@databiosphere/findable-ui/lib/hooks/useAuthentication/useAuthentication";
import { ContentView } from "@databiosphere/findable-ui/lib/views/ContentView/contentView";
import { AccessPrompt } from "../../../app/components/common/Form/components/FormManager/components/AccessPrompt/accessPrompt";
import { Divider } from "../../../app/components/Detail/components/TrackerForm/components/Divider/divider.styles";
import { RefreshForm } from "../../../app/components/Forms/components/Refresh/refresh";
import { Content } from "../../../app/components/Layout/components/Content/content";
import { LAYOUT_STYLE_NO_CONTRAST_DEFAULT } from "../../../app/content/common/constants";

export const RefreshView = (): JSX.Element => {
  const { isAuthenticated } = useAuthentication();
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
