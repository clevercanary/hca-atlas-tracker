import { type PathParameter } from "@/app/common/entities";
import { SnackbarProvider } from "@/app/components/common/Snackbar/provider/provider";
import { SourceStudyView } from "@/app/views/SourceStudyView/sourceStudyView";
import { type GetServerSideProps, type GetServerSidePropsContext } from "next";
import { type ParsedUrlQuery } from "querystring";
import { type JSX } from "react";

interface SourceStudyPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
  sourceStudyId: string;
}

interface SourceStudyPageProps {
  pathParameter: PathParameter;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { atlasId, sourceStudyId } = context.params as SourceStudyPageUrlParams;
  return {
    props: {
      pageTitle: "Source Study",
      pathParameter: { atlasId, sourceStudyId },
    },
  };
};

const SourceStudyPage = ({
  pathParameter,
}: SourceStudyPageProps): JSX.Element => {
  return (
    <SnackbarProvider>
      <SourceStudyView pathParameter={pathParameter} />
    </SnackbarProvider>
  );
};

export default SourceStudyPage;
