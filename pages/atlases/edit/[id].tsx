import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {
      pageTitle: "Edit Atlas",
    },
  };
};

const EditAtlasPage = (): JSX.Element => {
  return <></>;
};

export default EditAtlasPage;
