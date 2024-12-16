import { HCAAtlasTrackerAtlas } from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { AtlasEditData } from "../../../../../../views/AtlasView/common/entities";
import { SectionContentProps } from "../../../../../Forms/common/entities";
import { IdentifiersSection } from "../IdentifiersSection/identifiersSection";

export const ViewAtlasIdentifiersSection = ({
  formManager,
  formMethod,
  fullWidth,
}: SectionContentProps<AtlasEditData, HCAAtlasTrackerAtlas>): JSX.Element => {
  return (
    <IdentifiersSection
      cellxgeneAtlasCollectionName="cellxgeneAtlasCollection"
      formManager={formManager}
      formMethod={formMethod}
      fullWidth={fullWidth}
    />
  );
};
