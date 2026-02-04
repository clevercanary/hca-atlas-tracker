import { JSX } from "react";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import { AtlasId } from "../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../../app/common/entities";
import { AtlasMetadataEntrySheetsView } from "../../../../app/views/AtlasMetadataEntrySheetsView/atlasMetadataEntrySheetsView";

interface MetadataEntrySheetsPageUrlParams extends ParsedUrlQuery {
  atlasId: AtlasId;
}

interface MetadataEntrySheetsPageProps {
  pathParameter: PathParameter;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { atlasId } = context.params as MetadataEntrySheetsPageUrlParams;
  return {
    props: {
      pageTitle: "Metadata Entry Sheets",
      pathParameter: { atlasId },
    },
  };
};

const ViewMetadataEntrySheetsPage = ({
  pathParameter,
}: MetadataEntrySheetsPageProps): JSX.Element => {
  return <AtlasMetadataEntrySheetsView pathParameter={pathParameter} />;
};

export default ViewMetadataEntrySheetsPage;
