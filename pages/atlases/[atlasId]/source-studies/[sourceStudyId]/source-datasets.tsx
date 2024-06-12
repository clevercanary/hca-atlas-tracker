import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import { PathParameter } from "../../../../../app/common/entities";
import { FetchDataStateProvider } from "../../../../../app/providers/fetchDataState/fetchDataState";
import { SourceDatasetsView } from "../../../../../app/views/SourceDatasetsView/sourceDatasetsView";

interface SourceStudySourceDatasetsPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
  sourceStudyId: string;
}

interface SourceStudySourceDatasetsPageProps {
  pathParameter: PathParameter;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { atlasId, sourceStudyId } =
    context.params as SourceStudySourceDatasetsPageUrlParams;
  return {
    props: {
      pageTitle: "Source Datasets",
      pathParameter: { atlasId, sourceStudyId },
    },
  };
};

const SourceStudySourceDatasetsPage = ({
  pathParameter,
}: SourceStudySourceDatasetsPageProps): JSX.Element => {
  return (
    <FetchDataStateProvider>
      <SourceDatasetsView pathParameter={pathParameter} />
    </FetchDataStateProvider>
  );
};

export default SourceStudySourceDatasetsPage;
