import { JSX } from "react";
import { Main } from "@databiosphere/findable-ui/lib/components/Layout/components/ContentLayout/components/Main/main";
import { GetStaticProps } from "next";
import { FilesAdminView } from "../../app/views/FilesAdminView/filesAdminView";

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      pageTitle: "Manage files",
    },
  };
};

const FilesAdminPage = (): JSX.Element => {
  return <FilesAdminView />;
};

FilesAdminPage.Main = Main;

export default FilesAdminPage;
