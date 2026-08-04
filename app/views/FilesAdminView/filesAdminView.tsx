import { FilesAdminForm } from "@/app/components/Forms/components/FilesAdmin/filesAdmin";
import { Content } from "@/app/components/Layout/components/Content/content";
import { LAYOUT_STYLE_NO_CONTRAST_DEFAULT } from "@/app/content/common/constants";
import { ContentView } from "@databiosphere/findable-ui/lib/views/ContentView/contentView";
import { type JSX } from "react";

export const FilesAdminView = (): JSX.Element => {
  return (
    <ContentView
      content={
        <Content>
          <h1>Manage files</h1>
          <FilesAdminForm />
        </Content>
      }
      layoutStyle={LAYOUT_STYLE_NO_CONTRAST_DEFAULT}
    />
  );
};
