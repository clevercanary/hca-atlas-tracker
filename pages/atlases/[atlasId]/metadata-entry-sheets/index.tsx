import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import { PathParameter } from "../../../../app/common/entities";
import { AtlasMetadataEntrySheetView } from "../../../../app/views/AtlasMetadataEntrySheetsView/atlasMetadataEntrySheetsView";

interface MetadataEntrySheetsPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
}

interface MetadataEntrySheetsPageProps {
  pathParameter: PathParameter;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
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
  return <AtlasMetadataEntrySheetView pathParameter={pathParameter} />;
};

export default ViewMetadataEntrySheetsPage;
