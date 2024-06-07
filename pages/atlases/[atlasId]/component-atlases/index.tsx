import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import { ComponentAtlasesView } from "../../../../app/views/ComponentAtlasesView/componentAtlasesView";

interface ComponentAtlasesPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
}

interface ComponentAtlasesPageProps {
  atlasId: string;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { atlasId } = context.params as ComponentAtlasesPageUrlParams;
  return {
    props: {
      atlasId,
      pageTitle: "Component Atlases",
    },
  };
};

const ViewComponentAtlasesPage = ({
  atlasId,
}: ComponentAtlasesPageProps): JSX.Element => {
  return <ComponentAtlasesView atlasId={atlasId} />;
};

export default ViewComponentAtlasesPage;
