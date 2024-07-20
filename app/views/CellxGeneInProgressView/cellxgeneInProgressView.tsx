import { useAuthentication } from "@databiosphere/findable-ui/lib/hooks/useAuthentication/useAuthentication";
import { ContentView } from "@databiosphere/findable-ui/lib/views/ContentView/contentView";
import { AccessPrompt } from "../../../app/components/common/Form/components/FormManager/components/AccessPrompt/accessPrompt";
import { Divider } from "../../../app/components/Detail/components/TrackerForm/components/Divider/divider.styles";
import { CellxGeneInProgressForm } from "../../../app/components/Forms/components/CellxGeneInProgress/cellxgeneInProgress";
import { Content } from "../../../app/components/Layout/components/Content/content";
import { LAYOUT_STYLE_NO_CONTRAST_DEFAULT } from "../../../app/content/common/constants";

export const CellxGeneInProgressView = (): JSX.Element => {
  const { isAuthenticated } = useAuthentication();
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
