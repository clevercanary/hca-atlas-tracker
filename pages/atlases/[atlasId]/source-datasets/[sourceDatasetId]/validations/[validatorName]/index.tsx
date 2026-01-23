import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import { ValidatorName } from "../../../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../../../../../app/common/entities";
import { AtlasSourceDatasetValidationView } from "../../../../../../../app/views/AtlasSourceDatasetValidationView/atlasSourceDatasetValidationView";

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
