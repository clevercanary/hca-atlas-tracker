import { GetServerSideProps } from "next";
import { JSX } from "react";
import { getAdminPageRedirect } from "../../app/routes/adminPageGuard";
import { AddNewUserView } from "../../app/views/AddNewUserView/addNewUserView";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const redirect = await getAdminPageRedirect(context);
  if (redirect) return redirect;
  return {
    props: {
      pageTitle: "Add New User",
    },
  };
};

const CreateUserPage = (): JSX.Element => {
  return <AddNewUserView />;
};

export default CreateUserPage;
