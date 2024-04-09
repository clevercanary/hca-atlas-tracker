import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import { ViewSourceDatasetsView } from "../../../../app/views/ViewSourceDatasetsView/viewSourceDatasetsView";

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
  return <ViewSourceDatasetsView atlasId={atlasId} />;
};

export default ViewSourceDatasetsPage;
