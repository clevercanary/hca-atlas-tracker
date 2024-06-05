import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import { AddNewSourceStudyView } from "../../../../app/views/AddNewSourceDatasetView/addNewSourceDatasetView";

interface CreateSourceStudyPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
}

interface CreateSourceStudyPageProps {
  atlasId: string;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { atlasId } = context.params as CreateSourceStudyPageUrlParams;
  return {
    props: {
      atlasId,
      pageTitle: "Add New Source Study",
    },
  };
};

const CreateSourceStudyPage = ({
  atlasId,
}: CreateSourceStudyPageProps): JSX.Element => {
  return <AddNewSourceStudyView atlasId={atlasId} />;
};

export default CreateSourceStudyPage;
