import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import { AddNewComponentAtlasView } from "../../../../app/views/AddNewComponentAtlasView/addNewComponentAtlasView";

interface CreateComponentAtlasPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
}

interface CreateComponentAtlasPageProps {
  atlasId: string;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { atlasId } = context.params as CreateComponentAtlasPageUrlParams;
  return {
    props: {
      atlasId,
      pageTitle: "Add New Component Atlas",
    },
  };
};

const CreateComponentAtlasPage = ({
  atlasId,
}: CreateComponentAtlasPageProps): JSX.Element => {
  return <AddNewComponentAtlasView atlasId={atlasId} />;
};

export default CreateComponentAtlasPage;
