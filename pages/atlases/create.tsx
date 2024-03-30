import { GetStaticProps } from "next";

export const getStaticProps: GetStaticProps = async () => {
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
