import { ContentView } from "@databiosphere/findable-ui/lib/views/ContentView/contentView";
import { JSX } from "react";
import { FilesAdminForm } from "../../components/Forms/components/FilesAdmin/filesAdmin";
import { Content } from "../../components/Layout/components/Content/content";
import { LAYOUT_STYLE_NO_CONTRAST_DEFAULT } from "../../content/common/constants";

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
