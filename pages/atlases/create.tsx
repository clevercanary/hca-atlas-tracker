import { GetServerSideProps } from "next";
import { JSX } from "react";
import { AddNewAtlasView } from "../../app/views/AddNewAtlasView/addNewAtlasView";

export const getServerSideProps: GetServerSideProps = async () => {
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
