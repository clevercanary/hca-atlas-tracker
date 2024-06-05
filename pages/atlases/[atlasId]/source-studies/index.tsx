import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import { SourceStudiesView } from "../../../../app/views/SourceStudiesView/sourceStudiesView";

interface SourceStudiesPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
}

interface SourceStudiesPageProps {
  atlasId: string;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { atlasId } = context.params as SourceStudiesPageUrlParams;
  return {
    props: {
      atlasId,
      pageTitle: "Source Studies",
    },
  };
};

const ViewSourceStudiesPage = ({
  atlasId,
}: SourceStudiesPageProps): JSX.Element => {
  return <SourceStudiesView atlasId={atlasId} />;
};

export default ViewSourceStudiesPage;
