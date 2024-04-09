import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import { AddNewSourceDatasetView } from "../../../../app/views/AddNewSourceDatasetView/addNewSourceDatasetView";

interface CreateSourceDatasetsPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
}

interface CreateSourceDatasetsPageProps {
  atlasId: string;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { atlasId } = context.params as CreateSourceDatasetsPageUrlParams;
  return {
    props: {
      atlasId,
      pageTitle: "Add New Source Dataset",
    },
  };
};

const CreateSourceDatasetsPage = ({
  atlasId,
}: CreateSourceDatasetsPageProps): JSX.Element => {
  return <AddNewSourceDatasetView atlasId={atlasId} />;
};

export default CreateSourceDatasetsPage;
