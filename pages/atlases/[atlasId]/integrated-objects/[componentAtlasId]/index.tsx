import { type PathParameter } from "@/app/common/entities";
import { ComponentAtlasView } from "@/app/views/ComponentAtlasView/componentAtlasView";
import { type GetServerSideProps, type GetServerSidePropsContext } from "next";
import { type ParsedUrlQuery } from "querystring";
import { type JSX } from "react";

interface ComponentAtlasPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
  componentAtlasId: string;
}

interface ComponentAtlasPageProps {
  pathParameter: PathParameter;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { atlasId, componentAtlasId } =
    context.params as ComponentAtlasPageUrlParams;
  return {
    props: {
      pageTitle: "Integrated Object",
      pathParameter: { atlasId, componentAtlasId },
    },
  };
};

const ComponentAtlasPage = ({
  pathParameter,
}: ComponentAtlasPageProps): JSX.Element => {
  return <ComponentAtlasView pathParameter={pathParameter} />;
};

export default ComponentAtlasPage;
