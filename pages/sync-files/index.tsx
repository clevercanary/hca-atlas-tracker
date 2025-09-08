import { Main } from "@databiosphere/findable-ui/lib/components/Layout/components/ContentLayout/components/Main/main";
import { GetStaticProps } from "next";
import { SyncFilesView } from "../../app/views/SyncFilesView/syncFilesView";

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      pageTitle: "Sync Files From S3",
    },
  };
};

const SyncFilesPage = (): JSX.Element => {
  return <SyncFilesView />;
};

SyncFilesPage.Main = Main;

export default SyncFilesPage;
