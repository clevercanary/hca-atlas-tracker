import { type PathParameter } from "@/app/common/entities";
import { SnackbarProvider } from "@/app/components/common/Snackbar/provider/provider";
import { IntegratedObjectSourceDatasetsView } from "@/app/views/IntegratedObjectSourceDatasetsView/integratedObjectSourceDatasetsView";
import { type GetServerSideProps, type GetServerSidePropsContext } from "next";
import { type ParsedUrlQuery } from "querystring";
import { type JSX } from "react";

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
    <SnackbarProvider>
      <IntegratedObjectSourceDatasetsView pathParameter={pathParameter} />
    </SnackbarProvider>
  );
};

export default ViewIntegratedObjectSourceDatasetsPage;
