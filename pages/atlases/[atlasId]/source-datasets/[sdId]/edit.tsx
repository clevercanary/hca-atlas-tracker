import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import { EditSourceDatasetView } from "../../../../../app/views/EditSourceDatasetView/editSourceDatasetView";

interface EditSourceDatasetsPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
  sdId: string;
}

interface EditSourceDatasetsPageProps {
  atlasId: string;
  sdId: string;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { atlasId, sdId } = context.params as EditSourceDatasetsPageUrlParams;
  return {
    props: {
      atlasId,
      pageTitle: "Edit Source Dataset",
      sdId,
    },
  };
};

const EditSourceDatasetsPage = ({
  atlasId,
  sdId,
}: EditSourceDatasetsPageProps): JSX.Element => {
  return <EditSourceDatasetView atlasId={atlasId} sdId={sdId} />;
};

export default EditSourceDatasetsPage;
