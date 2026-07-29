import { RefreshView } from "@/app/views/RefreshView/refreshView";
import { Main } from "@databiosphere/findable-ui/lib/components/Layout/components/ContentLayout/components/Main/main";
import { GetStaticProps } from "next";
import { JSX } from "react";

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      pageTitle: "Refresh External Entities",
    },
  };
};

const OverviewPage = (): JSX.Element => {
  return <RefreshView />;
};

OverviewPage.Main = Main;

export default OverviewPage;
