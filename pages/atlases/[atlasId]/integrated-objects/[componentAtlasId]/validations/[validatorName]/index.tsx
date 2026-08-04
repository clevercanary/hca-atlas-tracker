import { type ValidatorName } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type PathParameter } from "@/app/common/entities";
import { IntegratedObjectValidationView } from "@/app/views/IntegratedObjectValidationView/integratedObjectValidationView";
import { type GetServerSideProps, type GetServerSidePropsContext } from "next";
import { type ParsedUrlQuery } from "querystring";
import { type JSX } from "react";

interface IntegratedObjectValidationPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
  componentAtlasId: string;
  validatorName: ValidatorName;
}

interface IntegratedObjectValidationPageProps {
  pathParameter: PathParameter;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { atlasId, componentAtlasId, validatorName } =
    context.params as IntegratedObjectValidationPageUrlParams;
  return {
    props: {
      pageTitle: "Integrated Object Validation",
      pathParameter: { atlasId, componentAtlasId, validatorName },
    },
  };
};

const IntegratedObjectValidationPage = ({
  pathParameter,
}: IntegratedObjectValidationPageProps): JSX.Element => {
  return <IntegratedObjectValidationView pathParameter={pathParameter} />;
};

export default IntegratedObjectValidationPage;
