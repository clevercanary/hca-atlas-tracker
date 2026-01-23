import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import { PathParameter } from "../../../../app/common/entities";
import { SourceStudiesView } from "../../../../app/views/SourceStudiesView/sourceStudiesView";

interface SourceStudiesPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
}

interface SourceStudiesPageProps {
  pathParameter: PathParameter;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { atlasId } = context.params as SourceStudiesPageUrlParams;
  return {
    props: {
      pageTitle: "Source Studies",
      pathParameter: { atlasId },
    },
  };
};

const ViewSourceStudiesPage = ({
  pathParameter,
}: SourceStudiesPageProps): JSX.Element => {
  return <SourceStudiesView pathParameter={pathParameter} />;
};

export default ViewSourceStudiesPage;
