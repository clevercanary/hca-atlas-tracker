import { JSX } from "react";
import { GetServerSideProps } from "next";
import { AddNewUserView } from "../../app/views/AddNewUserView/addNewUserView";

export const getServerSideProps: GetServerSideProps = async () => {
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
