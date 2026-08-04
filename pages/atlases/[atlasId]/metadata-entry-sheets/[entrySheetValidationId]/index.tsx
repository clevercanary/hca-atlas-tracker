import {
  type AtlasId,
  type EntrySheetValidationId,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type PathParameter } from "@/app/common/entities";
import { AtlasMetadataEntrySheetValidationView } from "@/app/views/AtlasMetadataEntrySheetValidationView/atlasMetadataEntrySheetValidationView";
import { type GetServerSideProps, type GetServerSidePropsContext } from "next";
import { type ParsedUrlQuery } from "querystring";
import { type JSX } from "react";

interface MetadataEntrySheetValidationPageUrlParams extends ParsedUrlQuery {
  atlasId: AtlasId;
  entrySheetValidationId: EntrySheetValidationId;
}

interface MetadataEntrySheetValidationPageProps {
  pathParameter: PathParameter;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
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
