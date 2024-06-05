import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import { SourceDatasetsView } from "../../../../app/views/SourceDatasetsView/sourceDatasetsView";

interface SourceDatasetsPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
}

interface SourceDatasetsPageProps {
  atlasId: string;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { atlasId } = context.params as SourceDatasetsPageUrlParams;
  return {
    props: {
      atlasId,
      pageTitle: "Source Datasets",
    },
  };
};

const ViewSourceDatasetsPage = ({
  atlasId,
}: SourceDatasetsPageProps): JSX.Element => {
  return <SourceDatasetsView atlasId={atlasId} />;
};

export default ViewSourceDatasetsPage;
