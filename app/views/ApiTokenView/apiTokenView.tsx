import { ApiTokenForm } from "@/app/components/Forms/components/ApiToken/apiToken";
import { Content } from "@/app/components/Layout/components/Content/content";
import { LAYOUT_STYLE_NO_CONTRAST_DEFAULT } from "@/app/content/common/constants";
import { ContentView } from "@databiosphere/findable-ui/lib/views/ContentView/contentView";
import { type JSX } from "react";

export const ApiTokenView = (): JSX.Element => {
  return (
    <ContentView
      content={
        <Content>
          <h1>API Token</h1>
          <ApiTokenForm />
        </Content>
      }
      layoutStyle={LAYOUT_STYLE_NO_CONTRAST_DEFAULT}
    />
  );
};
