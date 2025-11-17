import { HCAAtlasTrackerSourceDataset } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { ControllerConfig } from "../../../components/common/Form/components/Controllers/common/entities";
import { FIELD_NAME } from "./constants";
import { ViewAtlasSourceDatasetData } from "./entities";

type CommonControllerConfig = ControllerConfig<
  ViewAtlasSourceDatasetData,
  HCAAtlasTrackerSourceDataset
>;

const CAP_URL: CommonControllerConfig = {
  inputProps: {
    isFullWidth: true,
    label: "CAP URL",
    readOnly: false,
  },
  name: FIELD_NAME.CAP_URL,
};

const FILE_NAME: CommonControllerConfig = {
  inputProps: {
    isFullWidth: true,
    label: "File Name",
    readOnly: true,
  },
  name: FIELD_NAME.FILE_NAME,
};

const SIZE_BYTES: CommonControllerConfig = {
  inputProps: {
    isFullWidth: true,
    label: "File Size",
    readOnly: true,
  },
  name: FIELD_NAME.SIZE_BYTES,
};

const VALIDATION_STATUS: CommonControllerConfig = {
  inputProps: {
    isFullWidth: true,
    label: "Validation Status",
    readOnly: true,
  },
  name: FIELD_NAME.VALIDATION_STATUS,
};

export const GENERAL_INFO_SOURCE_DATASET_CONTROLLERS: ControllerConfig<
  ViewAtlasSourceDatasetData,
  HCAAtlasTrackerSourceDataset
>[] = [FILE_NAME, SIZE_BYTES, VALIDATION_STATUS];

export const CAP_SOURCE_DATASET_CONTROLLERS: ControllerConfig<
  ViewAtlasSourceDatasetData,
  HCAAtlasTrackerSourceDataset
>[] = [CAP_URL];
