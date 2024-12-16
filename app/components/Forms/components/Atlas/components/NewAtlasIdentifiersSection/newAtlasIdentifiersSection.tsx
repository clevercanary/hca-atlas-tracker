import { HCAAtlasTrackerAtlas } from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { NewAtlasData } from "../../../../../../views/AddNewAtlasView/common/entities";
import { SectionContentProps } from "../../../../../Forms/common/entities";
import { IdentifiersSection } from "../IdentifiersSection/identifiersSection";

export const NewAtlasIdentifiersSection = ({
  formManager,
  formMethod,
  fullWidth,
}: SectionContentProps<NewAtlasData, HCAAtlasTrackerAtlas>): JSX.Element => {
  return (
    <IdentifiersSection
      cellxgeneAtlasCollectionName="cellxgeneAtlasCollection"
      formManager={formManager}
      formMethod={formMethod}
      fullWidth={fullWidth}
    />
  );
};
