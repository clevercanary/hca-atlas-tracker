import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import { PathParameter } from "../../../../app/common/entities";
import { AtlasMetadataEntrySheetView } from "../../../../app/views/AtlasMetadataEntrySheetView/atlasMetadataEntrySheetsView";

interface MetadataEntrySheetPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
}

interface MetadataEntrySheetPageProps {
  pathParameter: PathParameter;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { atlasId } = context.params as MetadataEntrySheetPageUrlParams;
  return {
    props: {
      pageTitle: "Metadata Entry Sheet",
      pathParameter: { atlasId },
    },
  };
};

const ViewMetadataEntrySheetPage = ({
  pathParameter,
}: MetadataEntrySheetPageProps): JSX.Element => {
  return <AtlasMetadataEntrySheetView pathParameter={pathParameter} />;
};

export default ViewMetadataEntrySheetPage;
