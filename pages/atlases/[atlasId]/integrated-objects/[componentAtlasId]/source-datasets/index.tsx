import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import { PathParameter } from "../../../../../../app/common/entities";
import { FetchDataStateProvider } from "../../../../../../app/providers/fetchDataState/fetchDataState";

interface IntegratedObjectSourceDatasetsPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
  componentAtlasId: string;
}

interface IntegratedObjectSourceDatasetsPageProps {
  pathParameter: PathParameter;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { atlasId, componentAtlasId } =
    context.params as IntegratedObjectSourceDatasetsPageUrlParams;
  return {
    props: {
      pageTitle: "Integrated Objects Source Datasets",
      pathParameter: { atlasId, componentAtlasId },
    },
  };
};

const ViewIntegratedObjectSourceDatasetsPage = ({
  pathParameter,
}: IntegratedObjectSourceDatasetsPageProps): JSX.Element => {
  return (
    <FetchDataStateProvider>
      <div>IO Source Datasets Page {pathParameter.componentAtlasId}</div>
    </FetchDataStateProvider>
  );
};

export default ViewIntegratedObjectSourceDatasetsPage;
