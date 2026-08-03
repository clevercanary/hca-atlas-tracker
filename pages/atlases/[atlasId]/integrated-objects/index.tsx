import { type PathParameter } from "@/app/common/entities";
import { ArchivedProvider } from "@/app/components/Entity/providers/archived/provider";
import { ComponentAtlasesView } from "@/app/views/ComponentAtlasesView/componentAtlasesView";
import { type GetServerSideProps, type GetServerSidePropsContext } from "next";
import { type ParsedUrlQuery } from "querystring";
import { type JSX } from "react";

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
      <ComponentAtlasesView pathParameter={pathParameter} />
    </ArchivedProvider>
  );
};

export default ViewComponentAtlasesPage;
