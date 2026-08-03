import { type PathParameter } from "@/app/common/entities";
import { ArchivedProvider } from "@/app/components/Entity/providers/archived/provider";
import { AtlasSourceDatasetsView } from "@/app/views/AtlasSourceDatasetsView/atlasSourceDatasetsView";
import { type GetServerSideProps, type GetServerSidePropsContext } from "next";
import { type ParsedUrlQuery } from "querystring";
import { type JSX } from "react";

interface SourceDatasetsPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
}

interface SourceDatasetsPageProps {
  pathParameter: PathParameter;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { atlasId } = context.params as SourceDatasetsPageUrlParams;
  return {
    props: {
      pageTitle: "Source Datasets",
      pathParameter: { atlasId },
    },
  };
};

const ViewSourceDatasetsPage = ({
  pathParameter,
}: SourceDatasetsPageProps): JSX.Element => {
  return (
    <ArchivedProvider>
      <AtlasSourceDatasetsView pathParameter={pathParameter} />
    </ArchivedProvider>
  );
};

export default ViewSourceDatasetsPage;
