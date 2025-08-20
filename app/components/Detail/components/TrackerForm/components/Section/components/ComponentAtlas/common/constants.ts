import { HCAAtlasTrackerComponentAtlas } from "../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { NewComponentAtlasData } from "../../../../../../../../../views/AddNewComponentAtlasView/common/entities";
import { FIELD_NAME } from "../../../../../../../../../views/ComponentAtlasView/common/constants";
import { ControllerConfig } from "../../../../../../../../common/Form/components/Controllers/common/entities";

type CommonControllerConfig = ControllerConfig<
  NewComponentAtlasData,
  HCAAtlasTrackerComponentAtlas
>;

const TITLE: CommonControllerConfig = {
  inputProps: {
    isFullWidth: true,
    label: "Title",
    readOnly: true,
  },
  name: FIELD_NAME.TITLE,
};

export const GENERAL_INFO_NEW_COMPONENT_ATLAS_CONTROLLERS: ControllerConfig<
  NewComponentAtlasData,
  HCAAtlasTrackerComponentAtlas
>[] = [TITLE];
