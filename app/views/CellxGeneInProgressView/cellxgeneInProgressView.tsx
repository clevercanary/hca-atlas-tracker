import { ContentView } from "@databiosphere/findable-ui/lib/views/ContentView/contentView";
import { CellxGeneInProgressForm } from "../../../app/components/Forms/components/CellxGeneInProgress/cellxgeneInProgress";
import { Content } from "../../../app/components/Layout/components/Content/content";
import { LAYOUT_STYLE_NO_CONTRAST_DEFAULT } from "../../../app/content/common/constants";

export const CellxGeneInProgressView = (): JSX.Element => (
  <ContentView
    content={
      <Content>
        <h1>Set CELLxGENE In Progress</h1>
        <CellxGeneInProgressForm />
      </Content>
    }
    layoutStyle={LAYOUT_STYLE_NO_CONTRAST_DEFAULT}
  />
);
