import { JSX } from "react";
import { useAuth } from "@databiosphere/findable-ui/lib/providers/authentication/auth/hook";
import { ContentView } from "@databiosphere/findable-ui/lib/views/ContentView/contentView";
import { AccessPrompt } from "../../components/common/Form/components/FormManager/components/AccessPrompt/accessPrompt";
import { Divider } from "../../components/Detail/components/TrackerForm/components/Divider/divider.styles";
import { CellxGeneInProgressForm } from "../../components/Forms/components/CellxGeneInProgress/cellxgeneInProgress";
import { Content } from "../../components/Layout/components/Content/content";
import { LAYOUT_STYLE_NO_CONTRAST_DEFAULT } from "../../content/common/constants";

export const CellxGeneInProgressView = (): JSX.Element => {
  const {
    authState: { isAuthenticated },
  } = useAuth();
  return (
    <ContentView
      content={
        <Content>
          <h1>Set CELLxGENE In Progress</h1>
          {isAuthenticated ? (
            <CellxGeneInProgressForm />
          ) : (
            <AccessPrompt
              divider={<Divider />}
              text="to set tasks as in progress"
            />
          )}
        </Content>
      }
      layoutStyle={LAYOUT_STYLE_NO_CONTRAST_DEFAULT}
    />
  );
};
