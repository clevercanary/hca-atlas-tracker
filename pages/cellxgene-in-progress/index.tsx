import { Main } from "@databiosphere/findable-ui/lib/components/Layout/components/ContentLayout/components/Main/main";
import { CellxGeneInProgressView } from "app/views/CellxGeneInProgressView/cellxgeneInProgressView";
import { GetStaticProps } from "next";

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      pageTitle: "Set CELLxGENE In Progress",
    },
  };
};

const OverviewPage = (): JSX.Element => {
  return <CellxGeneInProgressView />;
};

OverviewPage.Main = Main;

export default OverviewPage;
