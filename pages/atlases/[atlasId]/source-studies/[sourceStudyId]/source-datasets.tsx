import { type PathParameter } from "@/app/common/entities";
import { SnackbarProvider } from "@/app/components/common/Snackbar/provider/provider";
import { SourceDatasetsView } from "@/app/views/SourceDatasetsView/sourceDatasetsView";
import { type GetServerSideProps, type GetServerSidePropsContext } from "next";
import { type ParsedUrlQuery } from "querystring";
import { type JSX } from "react";

interface SourceStudySourceDatasetsPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
  sourceStudyId: string;
}

interface SourceStudySourceDatasetsPageProps {
  pathParameter: PathParameter;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { atlasId, sourceStudyId } =
    context.params as SourceStudySourceDatasetsPageUrlParams;
  return {
    props: {
      pageTitle: "Datasets",
      pathParameter: { atlasId, sourceStudyId },
    },
  };
};

const SourceStudySourceDatasetsPage = ({
  pathParameter,
}: SourceStudySourceDatasetsPageProps): JSX.Element => {
  // SnackbarProvider is required by the view's source study actions (delete
  // routes its errors to the snackbar).
  return (
    <SnackbarProvider>
      <SourceDatasetsView pathParameter={pathParameter} />
    </SnackbarProvider>
  );
};

export default SourceStudySourceDatasetsPage;
