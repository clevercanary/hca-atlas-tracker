import { RefreshForm } from "@/app/components/Forms/components/Refresh/refresh";
import { Content } from "@/app/components/Layout/components/Content/content";
import { LAYOUT_STYLE_NO_CONTRAST_DEFAULT } from "@/app/content/common/constants";
import { ContentView } from "@databiosphere/findable-ui/lib/views/ContentView/contentView";
import { JSX } from "react";

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
