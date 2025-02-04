import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import { PathParameter } from "../../../../app/common/entities";
import { AtlasMetadataCorrectnessView } from "../../../../app/views/AtlasMetadataCorrectnessView/atlasMetadataCorrectnessView";

interface MetadataCorrectnessPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
}

interface MetadataCorrectnessPageProps {
  pathParameter: PathParameter;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { atlasId } = context.params as MetadataCorrectnessPageUrlParams;
  return {
    props: {
      pageTitle: "Metadata Correctness",
      pathParameter: { atlasId },
    },
  };
};

const ViewMetadataCorrectnessPage = ({
  pathParameter,
}: MetadataCorrectnessPageProps): JSX.Element => {
  return <AtlasMetadataCorrectnessView pathParameter={pathParameter} />;
};

export default ViewMetadataCorrectnessPage;
