import { Main } from "@databiosphere/findable-ui/lib/components/Layout/components/ContentLayout/components/Main/main";
import { ContentView } from "@databiosphere/findable-ui/lib/views/ContentView/contentView";
import { GetStaticProps } from "next";
import { Content } from "../../app/components/Layout/components/Content/content";
import { LAYOUT_STYLE_NO_CONTRAST_DEFAULT } from "../../app/content/common/constants";
import { RegistrationRequiredView } from "../../app/views/RegistrationRequiredView/registrationRequiredView";

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: { pageTitle: "Registration Required" },
  };
};

const Page = (): JSX.Element => {
  return (
    <ContentView
      content={
        <Content>
          <RegistrationRequiredView />
        </Content>
      }
      layoutStyle={LAYOUT_STYLE_NO_CONTRAST_DEFAULT}
    />
  );
};

Page.Main = Main;

export default Page;
