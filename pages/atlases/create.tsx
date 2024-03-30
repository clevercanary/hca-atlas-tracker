import { GetStaticProps } from "next";

export const getServerSideProps: GetStaticProps = async () => {
  return {
    props: {
      pageTitle: "Create Atlas",
    },
  };
};

const CreateAtlasPage = (): JSX.Element => {
  return <></>;
};

export default CreateAtlasPage;
