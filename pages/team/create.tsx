import { getAdminPageRedirect } from "@/app/routes/adminPageGuard";
import { AddNewUserView } from "@/app/views/AddNewUserView/addNewUserView";
import { type GetServerSideProps } from "next";
import { type JSX } from "react";

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
