import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import { AtlasView } from "../../../app/views/AtlasView/atlasView";

interface AtlasPageProps {
  atlasId: string;
}

interface AtlasPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { atlasId } = context.params as AtlasPageUrlParams;
  return {
    props: {
      atlasId,
      pageTitle: "Atlas",
    },
  };
};

const AtlasPage = ({ atlasId }: AtlasPageProps): JSX.Element => {
  return <AtlasView atlasId={atlasId} />;
};

export default AtlasPage;
