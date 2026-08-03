import { type PathParameter } from "@/app/common/entities";
import { AtlasView } from "@/app/views/AtlasView/atlasView";
import { type GetServerSideProps, type GetServerSidePropsContext } from "next";
import { type ParsedUrlQuery } from "querystring";
import { type JSX } from "react";

interface AtlasPageProps {
  pathParameter: PathParameter;
}

interface AtlasPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { atlasId } = context.params as AtlasPageUrlParams;
  return {
    props: {
      pageTitle: "Atlas",
      pathParameter: { atlasId },
    },
  };
};

const AtlasPage = ({ pathParameter }: AtlasPageProps): JSX.Element => {
  return <AtlasView pathParameter={pathParameter} />;
};

export default AtlasPage;
