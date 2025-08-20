import { ControllerConfig } from "app/components/common/Form/components/Controllers/common/entities";
import { HCAAtlasTrackerComponentAtlas } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FIELD_NAME } from "./constants";
import { ComponentAtlasViewData } from "./entities";

type CommonControllerConfig = ControllerConfig<
  ComponentAtlasViewData,
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

export const GENERAL_INFO_VIEW_COMPONENT_ATLAS_CONTROLLERS: ControllerConfig<
  ComponentAtlasViewData,
  HCAAtlasTrackerComponentAtlas
>[] = [TITLE];
