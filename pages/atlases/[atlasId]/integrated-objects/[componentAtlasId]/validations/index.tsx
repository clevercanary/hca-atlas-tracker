import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import { getRouteURL } from "../../../../../../app/common/utils";
import { ROUTE } from "../../../../../../app/routes/constants";

interface IntegratedObjectPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
  componentAtlasId: string;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { atlasId, componentAtlasId } =
    context.params as IntegratedObjectPageUrlParams;
  return {
    redirect: {
      destination: getRouteURL(ROUTE.INTEGRATED_OBJECT_VALIDATION, {
        atlasId,
        componentAtlasId,
        validatorName: "cap",
      }),
      permanent: true,
    },
  };
};

const IntegratedObjectValidationsPage = (): JSX.Element => <></>;

export default IntegratedObjectValidationsPage;
