import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import { getRouteURL } from "../../../../../../app/common/utils";
import { ROUTE } from "../../../../../../app/routes/constants";

interface SourceDatasetPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
  sourceDatasetId: string;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { atlasId, sourceDatasetId } =
    context.params as SourceDatasetPageUrlParams;
  return {
    redirect: {
      destination: getRouteURL(ROUTE.ATLAS_SOURCE_DATASET_VALIDATION, {
        atlasId,
        sourceDatasetId,
        validatorName: "cap",
      }),
      permanent: true,
    },
  };
};

const SourceDatasetValidationsPage = (): JSX.Element => <></>;

export default SourceDatasetValidationsPage;
