import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import { PathParameter } from "../../../../../app/common/entities";
import { SourceStudyView } from "../../../../../app/views/SourceStudyView/sourceStudyView";

interface SourceStudyPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
  sourceStudyId: string;
}

interface SourceStudyPageProps {
  pathParameter: PathParameter;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { atlasId, sourceStudyId } = context.params as SourceStudyPageUrlParams;
  return {
    props: {
      pageTitle: "Source Study",
      pathParameter: { atlasId, sourceStudyId },
    },
  };
};

const SourceStudyPage = ({
  pathParameter,
}: SourceStudyPageProps): JSX.Element => {
  return <SourceStudyView pathParameter={pathParameter} />;
};

export default SourceStudyPage;
