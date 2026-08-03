import { getAdminPageRedirect } from "@/app/routes/adminPageGuard";
import { FilesAdminView } from "@/app/views/FilesAdminView/filesAdminView";
import { Main } from "@databiosphere/findable-ui/lib/components/Layout/components/ContentLayout/components/Main/main";
import { type GetServerSideProps } from "next";
import { type JSX } from "react";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const redirect = await getAdminPageRedirect(context);
  if (redirect) return redirect;
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
