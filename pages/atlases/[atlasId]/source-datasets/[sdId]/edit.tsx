import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {
      pageTitle: "Edit Source Dataset",
    },
  };
};

const EditAtlasPage = (): JSX.Element => {
  return <></>;
};

export default EditAtlasPage;
