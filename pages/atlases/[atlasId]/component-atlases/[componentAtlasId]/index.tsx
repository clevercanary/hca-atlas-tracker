import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import { ComponentAtlasView } from "../../../../../app/views/ComponentAtlasView/componentAtlasView";

interface ComponentAtlasPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
  componentAtlasId: string;
}

interface ComponentAtlasPageProps {
  atlasId: string;
  componentAtlasId: string;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { atlasId, componentAtlasId } =
    context.params as ComponentAtlasPageUrlParams;
  return {
    props: {
      atlasId,
      componentAtlasId,
      pageTitle: "Component Atlas",
    },
  };
};

const ComponentAtlasPage = ({
  atlasId,
  componentAtlasId,
}: ComponentAtlasPageProps): JSX.Element => {
  return (
    <ComponentAtlasView atlasId={atlasId} componentAtlasId={componentAtlasId} />
  );
};

export default ComponentAtlasPage;
