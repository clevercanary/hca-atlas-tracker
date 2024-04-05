import { GetServerSideProps } from "next";
import { AddNewAtlasView } from "../../app/views/AddNewAtlasView/addNewAtlasView";

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {
      pageTitle: "Add New Atlas",
    },
  };
};

const CreateAtlasPage = (): JSX.Element => {
  return <AddNewAtlasView />;
};

export default CreateAtlasPage;
