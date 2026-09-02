import { type PathParameter } from "@/app/common/entities";
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
  return <SourceDatasetsView pathParameter={pathParameter} />;
};

export default SourceStudySourceDatasetsPage;
