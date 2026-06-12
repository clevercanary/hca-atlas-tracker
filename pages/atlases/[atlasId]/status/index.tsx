import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import { JSX } from "react";
import { PathParameter } from "../../../../app/common/entities";
import { AtlasStatusView } from "../../../../app/views/AtlasStatusView/atlasStatusView";

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
