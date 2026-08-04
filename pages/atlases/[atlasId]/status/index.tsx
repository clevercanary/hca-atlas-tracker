import { type PathParameter } from "@/app/common/entities";
import { AtlasStatusView } from "@/app/views/AtlasStatusView/atlasStatusView";
import { type GetServerSideProps, type GetServerSidePropsContext } from "next";
import { type ParsedUrlQuery } from "querystring";
import { type JSX } from "react";

interface StatusPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
}

interface StatusPageProps {
  pathParameter: PathParameter;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { atlasId } = context.params as StatusPageUrlParams;
  return {
    props: {
      pageTitle: "Status",
      pathParameter: { atlasId },
    },
  };
};

const ViewStatusPage = ({ pathParameter }: StatusPageProps): JSX.Element => {
  return <AtlasStatusView pathParameter={pathParameter} />;
};

export default ViewStatusPage;
