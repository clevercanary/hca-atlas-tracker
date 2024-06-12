import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import { PathParameter } from "../../../../app/common/entities";
import { AddNewComponentAtlasView } from "../../../../app/views/AddNewComponentAtlasView/addNewComponentAtlasView";

interface CreateComponentAtlasPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
}

interface CreateComponentAtlasPageProps {
  pathParameter: PathParameter;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { atlasId } = context.params as CreateComponentAtlasPageUrlParams;
  return {
    props: {
      pageTitle: "Add New Component Atlas",
      pathParameter: { atlasId },
    },
  };
};

const CreateComponentAtlasPage = ({
  pathParameter,
}: CreateComponentAtlasPageProps): JSX.Element => {
  return <AddNewComponentAtlasView pathParameter={pathParameter} />;
};

export default CreateComponentAtlasPage;
