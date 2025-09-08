import { useAuth } from "@databiosphere/findable-ui/lib/providers/authentication/auth/hook";
import { ContentView } from "@databiosphere/findable-ui/lib/views/ContentView/contentView";
import { AccessPrompt } from "../../components/common/Form/components/FormManager/components/AccessPrompt/accessPrompt";
import { Divider } from "../../components/Detail/components/TrackerForm/components/Divider/divider.styles";
import { SyncFilesForm } from "../../components/Forms/components/SyncFiles/syncFiles";
import { Content } from "../../components/Layout/components/Content/content";
import { LAYOUT_STYLE_NO_CONTRAST_DEFAULT } from "../../content/common/constants";

export const SyncFilesView = (): JSX.Element => {
  const {
    authState: { isAuthenticated },
  } = useAuth();
  return (
    <ContentView
      content={
        <Content>
          <h1>Sync Files From S3</h1>
          {isAuthenticated ? (
            <SyncFilesForm />
          ) : (
            <AccessPrompt
              divider={<Divider />}
              text="to access sync controls"
            />
          )}
        </Content>
      }
      layoutStyle={LAYOUT_STYLE_NO_CONTRAST_DEFAULT}
    />
  );
};
