import { PathParameter } from "@/app/common/entities";
import { ArchivedProvider } from "@/app/components/Entity/providers/archived/provider";
import { ComponentAtlasesView } from "@/app/views/ComponentAtlasesView/componentAtlasesView";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import { JSX } from "react";

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
