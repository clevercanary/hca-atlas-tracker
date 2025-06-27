import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import {
  AtlasId,
  EntrySheetValidationId,
} from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../../../app/common/entities";
import { AtlasMetadataEntrySheetValidationView } from "../../../../../app/views/AtlasMetadataEntrySheetValidationView/atlasMetadataEntrySheetValidationView";

interface MetadataEntrySheetValidationPageUrlParams extends ParsedUrlQuery {
  atlasId: AtlasId;
  entrySheetValidationId: EntrySheetValidationId;
}

interface MetadataEntrySheetValidationPageProps {
  pathParameter: PathParameter;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { atlasId, entrySheetValidationId } =
    context.params as MetadataEntrySheetValidationPageUrlParams;
  return {
    props: {
      pageTitle: "Metadata Entry Sheet Validation",
      pathParameter: { atlasId, entrySheetValidationId },
    },
  };
};

const ViewMetadataEntrySheetValidationPage = ({
  pathParameter,
}: MetadataEntrySheetValidationPageProps): JSX.Element => {
  return (
    <AtlasMetadataEntrySheetValidationView pathParameter={pathParameter} />
  );
};

export default ViewMetadataEntrySheetValidationPage;
