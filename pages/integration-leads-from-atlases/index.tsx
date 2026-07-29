import { IntegrationLeadsFromAtlasesView } from "@/app/views/IntegrationLeadsFromAtlasesView/integrationLeadsFromAtlasesView";
import { Main } from "@databiosphere/findable-ui/lib/components/Layout/components/ContentLayout/components/Main/main";
import { GetStaticProps } from "next";
import { JSX } from "react";

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      pageTitle: "Update Integration Lead Users",
    },
  };
};

const OverviewPage = (): JSX.Element => {
  return <IntegrationLeadsFromAtlasesView />;
};

OverviewPage.Main = Main;

export default OverviewPage;
