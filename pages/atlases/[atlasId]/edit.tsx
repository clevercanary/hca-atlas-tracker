import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import { EditAtlasView } from "../../../app/views/EditAtlasView/editAtlasView";

interface EditPageProps {
  atlasId: string;
}

interface EditPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { atlasId } = context.params as EditPageUrlParams;
  return {
    props: {
      atlasId,
      pageTitle: "Edit Atlas",
    },
  };
};

const EditAtlasPage = ({ atlasId }: EditPageProps): JSX.Element => {
  return <EditAtlasView atlasId={atlasId} />;
};

export default EditAtlasPage;
