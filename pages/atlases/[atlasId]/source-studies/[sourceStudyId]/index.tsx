import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import { SourceStudyView } from "../../../../../app/views/SourceStudyView/sourceStudyView";

interface SourceDatasetPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
  sourceStudyId: string;
}

interface SourceDatasetPageProps {
  atlasId: string;
  sourceStudyId: string;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { atlasId, sourceStudyId } =
    context.params as SourceDatasetPageUrlParams;
  return {
    props: {
      atlasId,
      pageTitle: "Source Dataset",
      sourceStudyId,
    },
  };
};

const SourceDatasetsPage = ({
  atlasId,
  sourceStudyId,
}: SourceDatasetPageProps): JSX.Element => {
  return <SourceStudyView atlasId={atlasId} sourceStudyId={sourceStudyId} />;
};

export default SourceDatasetsPage;
