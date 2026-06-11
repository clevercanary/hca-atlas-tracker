import { ContentView } from "@databiosphere/findable-ui/lib/views/ContentView/contentView";
import { JSX } from "react";
import { CellxGeneInProgressForm } from "../../components/Forms/components/CellxGeneInProgress/cellxgeneInProgress";
import { Content } from "../../components/Layout/components/Content/content";
import { LAYOUT_STYLE_NO_CONTRAST_DEFAULT } from "../../content/common/constants";

export const CellxGeneInProgressView = (): JSX.Element => {
  return (
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
};
