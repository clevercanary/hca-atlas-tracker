import { PathParameter } from "@/app/common/entities";
import { IntegratedObjectSourceDatasetsView } from "@/app/views/IntegratedObjectSourceDatasetsView/integratedObjectSourceDatasetsView";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import { JSX } from "react";

interface IntegratedObjectSourceDatasetsPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
  componentAtlasId: string;
}

interface IntegratedObjectSourceDatasetsPageProps {
  pathParameter: PathParameter;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { atlasId, componentAtlasId } =
    context.params as IntegratedObjectSourceDatasetsPageUrlParams;
  return {
    props: {
      pageTitle: "Integrated Object Source Datasets",
      pathParameter: { atlasId, componentAtlasId },
    },
  };
};

const ViewIntegratedObjectSourceDatasetsPage = ({
  pathParameter,
}: IntegratedObjectSourceDatasetsPageProps): JSX.Element => {
  return <IntegratedObjectSourceDatasetsView pathParameter={pathParameter} />;
};

export default ViewIntegratedObjectSourceDatasetsPage;
