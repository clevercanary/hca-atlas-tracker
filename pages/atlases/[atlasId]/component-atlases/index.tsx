import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import { PathParameter } from "../../../../app/common/entities";
import { ComponentAtlasesView } from "../../../../app/views/ComponentAtlasesView/componentAtlasesView";

interface ComponentAtlasesPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
}

interface ComponentAtlasesPageProps {
  pathParameter: PathParameter;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { atlasId } = context.params as ComponentAtlasesPageUrlParams;
  return {
    props: {
      pageTitle: "Integration Objects",
      pathParameter: { atlasId },
    },
  };
};

const ViewComponentAtlasesPage = ({
  pathParameter,
}: ComponentAtlasesPageProps): JSX.Element => {
  return <ComponentAtlasesView pathParameter={pathParameter} />;
};

export default ViewComponentAtlasesPage;
