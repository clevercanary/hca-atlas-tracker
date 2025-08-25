import { HCAAtlasTrackerComponentAtlas } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { ControllerConfig } from "../../../components/common/Form/components/Controllers/common/entities";
import { FIELD_NAME } from "./constants";
import { ViewIntegratedObjectData } from "./entities";

type CommonControllerConfig = ControllerConfig<
  ViewIntegratedObjectData,
  HCAAtlasTrackerComponentAtlas
>;

const FILE_NAME: CommonControllerConfig = {
  inputProps: {
    isFullWidth: true,
    label: "File Name",
    readOnly: true,
  },
  name: FIELD_NAME.FILE_NAME,
};

const SIZE_BY_BYTES: CommonControllerConfig = {
  inputProps: {
    isFullWidth: true,
    label: "File Size",
    readOnly: true,
  },
  name: FIELD_NAME.SIZE_BY_BYTES,
};

const TITLE: CommonControllerConfig = {
  inputProps: {
    isFullWidth: true,
    label: "Title",
    readOnly: true,
  },
  name: FIELD_NAME.TITLE,
};

const VALIDATION_STATUS: CommonControllerConfig = {
  inputProps: {
    isFullWidth: true,
    label: "Validation Status",
    readOnly: true,
  },
  name: FIELD_NAME.VALIDATION_STATUS,
};

export const GENERAL_INFO_INTEGRATED_OBJECT_CONTROLLERS: ControllerConfig<
  ViewIntegratedObjectData,
  HCAAtlasTrackerComponentAtlas
>[] = [FILE_NAME, TITLE, SIZE_BY_BYTES, VALIDATION_STATUS];
