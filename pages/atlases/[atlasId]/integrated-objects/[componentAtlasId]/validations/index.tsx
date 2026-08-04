import { getRouteURL } from "@/app/common/utils";
import { ROUTE } from "@/app/routes/constants";
import { type GetServerSideProps, type GetServerSidePropsContext } from "next";
import { type ParsedUrlQuery } from "querystring";
import { type JSX } from "react";

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
