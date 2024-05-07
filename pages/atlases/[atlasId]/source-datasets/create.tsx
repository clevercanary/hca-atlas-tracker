import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import { AddNewSourceDatasetView } from "../../../../app/views/AddNewSourceDatasetView/addNewSourceDatasetView";

interface CreateSourceDatasetPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
}

interface CreateSourceDatasetPageProps {
  atlasId: string;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { atlasId } = context.params as CreateSourceDatasetPageUrlParams;
  return {
    props: {
      atlasId,
      pageTitle: "Add New Source Dataset",
    },
  };
};

const CreateSourceDatasetPage = ({
  atlasId,
}: CreateSourceDatasetPageProps): JSX.Element => {
  return <AddNewSourceDatasetView atlasId={atlasId} />;
};

export default CreateSourceDatasetPage;
