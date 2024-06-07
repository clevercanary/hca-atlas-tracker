import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import { SourceStudyView } from "../../../../../app/views/SourceStudyView/sourceStudyView";

interface SourceStudyPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
  sourceStudyId: string;
}

interface SourceStudyPageProps {
  atlasId: string;
  sourceStudyId: string;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { atlasId, sourceStudyId } = context.params as SourceStudyPageUrlParams;
  return {
    props: {
      atlasId,
      pageTitle: "Source Study",
      sourceStudyId,
    },
  };
};

const SourceStudyPage = ({
  atlasId,
  sourceStudyId,
}: SourceStudyPageProps): JSX.Element => {
  return <SourceStudyView atlasId={atlasId} sourceStudyId={sourceStudyId} />;
};

export default SourceStudyPage;
