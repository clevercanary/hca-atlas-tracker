import { JSX } from "react";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import { PathParameter } from "../../../../app/common/entities";
import { ArchivedProvider } from "../../../../app/components/Entity/providers/archived/provider";
import { FetchDataStateProvider } from "../../../../app/providers/fetchDataState/fetchDataState";
import { ComponentAtlasesView } from "../../../../app/views/ComponentAtlasesView/componentAtlasesView";

interface ComponentAtlasesPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
}

interface ComponentAtlasesPageProps {
  pathParameter: PathParameter;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { atlasId } = context.params as ComponentAtlasesPageUrlParams;
  return {
    props: {
      pageTitle: "Integrated Objects",
      pathParameter: { atlasId },
    },
  };
};

const ViewComponentAtlasesPage = ({
  pathParameter,
}: ComponentAtlasesPageProps): JSX.Element => {
  return (
    <ArchivedProvider>
      <FetchDataStateProvider>
        <ComponentAtlasesView pathParameter={pathParameter} />
      </FetchDataStateProvider>
    </ArchivedProvider>
  );
};

export default ViewComponentAtlasesPage;
