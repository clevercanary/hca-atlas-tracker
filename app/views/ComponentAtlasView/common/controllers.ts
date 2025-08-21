import { HCAAtlasTrackerComponentAtlas } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { ControllerConfig } from "../../../components/common/Form/components/Controllers/common/entities";
import { FIELD_NAME } from "./constants";
import { ViewIntegratedObjectData } from "./entities";

type CommonControllerConfig = ControllerConfig<
  ViewIntegratedObjectData,
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

export const GENERAL_INFO_INTEGRATED_OBJECT_CONTROLLERS: ControllerConfig<
  ViewIntegratedObjectData,
  HCAAtlasTrackerComponentAtlas
>[] = [TITLE];
