import { ContentView } from "@databiosphere/findable-ui/lib/views/ContentView/contentView";
import { JSX } from "react";
import { RefreshForm } from "../../components/Forms/components/Refresh/refresh";
import { Content } from "../../components/Layout/components/Content/content";
import { LAYOUT_STYLE_NO_CONTRAST_DEFAULT } from "../../content/common/constants";

export const RefreshView = (): JSX.Element => {
  return (
    <ContentView
      content={
        <Content>
          <h1>Refresh External Entities</h1>
          <RefreshForm />
        </Content>
      }
      layoutStyle={LAYOUT_STYLE_NO_CONTRAST_DEFAULT}
    />
  );
};
