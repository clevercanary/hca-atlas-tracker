import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import { PathParameter } from "../../../../app/common/entities";
import { FetchDataStateProvider } from "../../../../app/providers/fetchDataState/fetchDataState";
import { AtlasSourceDatasetsView } from "../../../../app/views/AtlasSourceDatasetsView/atlasSourceDatasetsView";

interface SourceDatasetsPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
}

interface SourceDatasetsPageProps {
  pathParameter: PathParameter;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { atlasId } = context.params as SourceDatasetsPageUrlParams;
  return {
    props: {
      pageTitle: "Source Datasets",
      pathParameter: { atlasId },
    },
  };
};

const ViewSourceDatasetsPage = ({
  pathParameter,
}: SourceDatasetsPageProps): JSX.Element => {
  return (
    <FetchDataStateProvider>
      <AtlasSourceDatasetsView pathParameter={pathParameter} />
    </FetchDataStateProvider>
  );
};

export default ViewSourceDatasetsPage;
