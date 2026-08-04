import { type PathParameter } from "@/app/common/entities";
import { AtlasSourceDatasetView } from "@/app/views/AtlasSourceDatasetView/atlasSourceDatasetView";
import { type GetServerSideProps, type GetServerSidePropsContext } from "next";
import { type ParsedUrlQuery } from "querystring";
import { type JSX } from "react";

interface SourceDatasetPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
  sourceDatasetId: string;
}

interface SourceDatasetPageProps {
  pathParameter: PathParameter;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { atlasId, sourceDatasetId } =
    context.params as SourceDatasetPageUrlParams;
  return {
    props: {
      pageTitle: "Source Dataset",
      pathParameter: { atlasId, sourceDatasetId },
    },
  };
};

const SourceDatasetPage = ({
  pathParameter,
}: SourceDatasetPageProps): JSX.Element => {
  return <AtlasSourceDatasetView pathParameter={pathParameter} />;
};

export default SourceDatasetPage;
