import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import { ValidationType } from "../../../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../../../../../app/common/entities";
import { AtlasSourceDatasetValidationView } from "../../../../../../../app/views/AtlasSourceDatasetValidationView/atlasSourceDatasetValidationView";

interface SourceDatasetValidationPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
  sourceDatasetId: string;
  validation: ValidationType;
}

interface SourceDatasetValidationPageProps {
  pathParameter: PathParameter;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { atlasId, sourceDatasetId, validation } =
    context.params as SourceDatasetValidationPageUrlParams;
  return {
    props: {
      pageTitle: "Source Dataset Validation",
      pathParameter: { atlasId, sourceDatasetId, validation },
    },
  };
};

const SourceDatasetValidationPage = ({
  pathParameter,
}: SourceDatasetValidationPageProps): JSX.Element => {
  return <AtlasSourceDatasetValidationView pathParameter={pathParameter} />;
};

export default SourceDatasetValidationPage;
