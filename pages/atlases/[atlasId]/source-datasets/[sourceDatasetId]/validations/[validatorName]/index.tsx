import { type ValidatorName } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type PathParameter } from "@/app/common/entities";
import { AtlasSourceDatasetValidationView } from "@/app/views/AtlasSourceDatasetValidationView/atlasSourceDatasetValidationView";
import { type GetServerSideProps, type GetServerSidePropsContext } from "next";
import { type ParsedUrlQuery } from "querystring";
import { type JSX } from "react";

interface SourceDatasetValidationPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
  sourceDatasetId: string;
  validatorName: ValidatorName;
}

interface SourceDatasetValidationPageProps {
  pathParameter: PathParameter;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { atlasId, sourceDatasetId, validatorName } =
    context.params as SourceDatasetValidationPageUrlParams;
  return {
    props: {
      pageTitle: "Source Dataset Validation",
      pathParameter: { atlasId, sourceDatasetId, validatorName },
    },
  };
};

const SourceDatasetValidationPage = ({
  pathParameter,
}: SourceDatasetValidationPageProps): JSX.Element => {
  return <AtlasSourceDatasetValidationView pathParameter={pathParameter} />;
};

export default SourceDatasetValidationPage;
