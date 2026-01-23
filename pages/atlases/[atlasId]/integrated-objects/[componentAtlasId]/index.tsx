import { JSX } from "react";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import { PathParameter } from "../../../../../app/common/entities";
import { FetchDataStateProvider } from "../../../../../app/providers/fetchDataState/fetchDataState";
import { ComponentAtlasView } from "../../../../../app/views/ComponentAtlasView/componentAtlasView";

interface ComponentAtlasPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
  componentAtlasId: string;
}

interface ComponentAtlasPageProps {
  pathParameter: PathParameter;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { atlasId, componentAtlasId } =
    context.params as ComponentAtlasPageUrlParams;
  return {
    props: {
      pageTitle: "Integrated Object",
      pathParameter: { atlasId, componentAtlasId },
    },
  };
};

const ComponentAtlasPage = ({
  pathParameter,
}: ComponentAtlasPageProps): JSX.Element => {
  return (
    <FetchDataStateProvider>
      <ComponentAtlasView pathParameter={pathParameter} />
    </FetchDataStateProvider>
  );
};

export default ComponentAtlasPage;
