import { HCAAtlasTrackerComponentAtlas } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { ControllerConfig } from "../../../components/common/Form/components/Controllers/common/entities";
import { Chip } from "../../../components/Form/components/Input/inputComponent/Chip/chip";
import { FIELD_NAME } from "./constants";
import { ViewIntegratedObjectData } from "./entities";
import { buildCAPIngestStatus, buildValidationStatus } from "./viewBuilders";

type CommonControllerConfig = ControllerConfig<
  ViewIntegratedObjectData,
  HCAAtlasTrackerComponentAtlas,
  "input" | typeof Chip
>;

const CAP_INGEST_STATUS: CommonControllerConfig = {
  inputProps: {
    inputComponent: Chip,
    isFullWidth: false,
    label: "CAP Ingest Status",
    readOnly: true,
  },
  name: FIELD_NAME.CAP_INGEST_STATUS,
  viewBuilder: buildCAPIngestStatus,
};

const CELL_COUNT: CommonControllerConfig = {
  inputProps: {
    isFullWidth: false,
    label: "Cell Count",
    readOnly: true,
  },
  name: FIELD_NAME.CELL_COUNT,
};

const FILE_EVENT_TIME: CommonControllerConfig = {
  inputProps: {
    isFullWidth: false,
    label: "Date Uploaded",
    readOnly: true,
  },
  name: FIELD_NAME.FILE_EVENT_TIME,
};

const FILE_NAME: CommonControllerConfig = {
  inputProps: {
    isFullWidth: false,
    label: "File Name",
    readOnly: true,
  },
  name: FIELD_NAME.FILE_NAME,
};

const SIZE_BY_BYTES: CommonControllerConfig = {
  inputProps: {
    isFullWidth: false,
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
    inputComponent: Chip,
    isFullWidth: false,
    isRowStart: true,
    label: "Validation Status",
    readOnly: true,
  },
  name: FIELD_NAME.VALIDATION_STATUS,
  viewBuilder: buildValidationStatus,
};

export const GENERAL_INFO_INTEGRATED_OBJECT_CONTROLLERS: CommonControllerConfig[] =
  [
    FILE_NAME,
    SIZE_BY_BYTES,
    TITLE,
    CELL_COUNT,
    VALIDATION_STATUS,
    CAP_INGEST_STATUS,
    FILE_EVENT_TIME,
  ];
