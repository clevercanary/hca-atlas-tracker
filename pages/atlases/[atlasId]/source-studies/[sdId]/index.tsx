import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import { SourceDatasetView } from "../../../../../app/views/SourceDatasetView/sourceDatasetView";

interface SourceDatasetPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
  sdId: string;
}

interface SourceDatasetPageProps {
  atlasId: string;
  sdId: string;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { atlasId, sdId } = context.params as SourceDatasetPageUrlParams;
  return {
    props: {
      atlasId,
      pageTitle: "Source Dataset",
      sdId,
    },
  };
};

const SourceDatasetsPage = ({
  atlasId,
  sdId,
}: SourceDatasetPageProps): JSX.Element => {
  return <SourceDatasetView atlasId={atlasId} sdId={sdId} />;
};

export default SourceDatasetsPage;
