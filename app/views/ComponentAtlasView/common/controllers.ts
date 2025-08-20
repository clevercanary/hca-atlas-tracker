import { HCAAtlasTrackerComponentAtlas } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { ControllerConfig } from "../../../components/common/Form/components/Controllers/common/entities";
import { FIELD_NAME } from "./constants";
import { ComponentAtlasEditData } from "./entities";

type CommonControllerConfig = ControllerConfig<
  ComponentAtlasEditData,
  HCAAtlasTrackerComponentAtlas
>;

const TITLE: CommonControllerConfig = {
  inputProps: {
    isFullWidth: true,
    label: "Title",
  },
  name: FIELD_NAME.TITLE,
};

export const GENERAL_INFO_INTEGRATED_OBJECTS_CONTROLLERS: ControllerConfig<
  ComponentAtlasEditData,
  HCAAtlasTrackerComponentAtlas
>[] = [TITLE];
