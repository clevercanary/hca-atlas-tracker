import { ApiTokenView } from "@/app/views/ApiTokenView/apiTokenView";
import { Main } from "@databiosphere/findable-ui/lib/components/Layout/components/ContentLayout/components/Main/main";
import { type GetStaticProps } from "next";
import { type JSX } from "react";

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      pageTitle: "API Token",
    },
  };
};

// Not linked from the navigation (like `/refresh`): reached by URL.
const ApiTokenPage = (): JSX.Element => {
  return <ApiTokenView />;
};

ApiTokenPage.Main = Main;

export default ApiTokenPage;
