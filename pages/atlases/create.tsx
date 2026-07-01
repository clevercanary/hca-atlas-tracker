import { GetServerSideProps } from "next";
import { JSX } from "react";
import { getAdminPageRedirect } from "../../app/routes/adminPageGuard";
import { AddNewAtlasView } from "../../app/views/AddNewAtlasView/addNewAtlasView";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const redirect = await getAdminPageRedirect(context);
  if (redirect) return redirect;
  return {
    props: {
      pageTitle: "Add New Atlas Family",
    },
  };
};

const CreateAtlasPage = (): JSX.Element => {
  return <AddNewAtlasView />;
};

export default CreateAtlasPage;
