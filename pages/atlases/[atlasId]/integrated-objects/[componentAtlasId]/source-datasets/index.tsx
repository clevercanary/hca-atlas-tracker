import { JSX } from "react";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import { PathParameter } from "../../../../../../app/common/entities";
import { FetchDataStateProvider } from "../../../../../../app/providers/fetchDataState/fetchDataState";
import { IntegratedObjectSourceDatasetsView } from "../../../../../../app/views/IntegratedObjectSourceDatasetsView/integratedObjectSourceDatasetsView";

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
  return (
    <FetchDataStateProvider>
      <IntegratedObjectSourceDatasetsView pathParameter={pathParameter} />
    </FetchDataStateProvider>
  );
};

export default ViewIntegratedObjectSourceDatasetsPage;
