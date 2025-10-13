import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import { PathParameter } from "../../../../../app/common/entities";
import { FetchDataStateProvider } from "../../../../../app/providers/fetchDataState/fetchDataState";
import { AtlasSourceDatasetView } from "../../../../../app/views/AtlasSourceDatasetView/atlasSourceDatasetView";

interface SourceDatasetPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
  sourceDatasetId: string;
}

interface SourceDatasetPageProps {
  pathParameter: PathParameter;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
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
  return (
    <FetchDataStateProvider>
      <AtlasSourceDatasetView pathParameter={pathParameter} />
    </FetchDataStateProvider>
  );
};

export default SourceDatasetPage;
