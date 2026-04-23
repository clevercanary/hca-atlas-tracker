import { HCAAtlasTrackerSourceDataset } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { ControllerConfig } from "../../../components/common/Form/components/Controllers/common/entities";
import { Chip } from "../../../components/Form/components/Input/inputComponent/Chip/chip";
import {
  buildCAPIngestStatus,
  buildValidationStatus,
} from "../../ComponentAtlasView/common/viewBuilders";
import { FIELD_NAME } from "./constants";
import { ViewAtlasSourceDatasetData } from "./entities";

type ChipInputControllerConfig = ControllerConfig<
  ViewAtlasSourceDatasetData,
  HCAAtlasTrackerSourceDataset,
  typeof Chip
>;

type CommonControllerConfig = ControllerConfig<
  ViewAtlasSourceDatasetData,
  HCAAtlasTrackerSourceDataset
>;

const CAP_INGEST_STATUS: ChipInputControllerConfig = {
  inputProps: {
    inputComponent: Chip,
    isFullWidth: false,
    label: "CAP Ingest Status",
    readOnly: true,
  },
  name: FIELD_NAME.CAP_INGEST_STATUS,
  viewBuilder: buildCAPIngestStatus,
};

const CAP_URL: CommonControllerConfig = {
  inputProps: {
    isFullWidth: true,
    label: "CAP URL",
  },
  labelLink: true,
  name: FIELD_NAME.CAP_URL,
};

const CELL_COUNT: CommonControllerConfig = {
  inputProps: {
    isFullWidth: false,
    label: "Cell Count",
    readOnly: true,
  },
  name: FIELD_NAME.CELL_COUNT,
};

const DOWNLOAD_NAME: CommonControllerConfig = {
  inputProps: {
    isFullWidth: false,
    label: "Download Name",
  },
  name: FIELD_NAME.DOWNLOAD_NAME,
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

const GENE_COUNT: CommonControllerConfig = {
  inputProps: {
    isFullWidth: false,
    label: "Gene Count",
    readOnly: true,
  },
  name: FIELD_NAME.GENE_COUNT,
};

const PUBLICATION_STATUS: CommonControllerConfig = {
  inputProps: {
    isFullWidth: true,
    label: "Study Status",
    readOnly: true,
  },
  name: FIELD_NAME.PUBLICATION_STATUS,
};

const PUBLISHED_AT: CommonControllerConfig = {
  inputProps: {
    isFullWidth: false,
    label: "Release Date",
    readOnly: true,
  },
  name: FIELD_NAME.PUBLISHED_AT,
};

const SIZE_BYTES: CommonControllerConfig = {
  inputProps: {
    isFullWidth: false,
    label: "File Size",
    readOnly: true,
  },
  name: FIELD_NAME.SIZE_BYTES,
};

const TITLE: CommonControllerConfig = {
  inputProps: {
    isFullWidth: true,
    label: "Dataset Title",
    readOnly: true,
  },
  name: FIELD_NAME.TITLE,
};

const VALIDATION_STATUS: ChipInputControllerConfig = {
  inputProps: {
    inputComponent: Chip,
    isFullWidth: false,
    label: "Validation Status",
    readOnly: true,
  },
  name: FIELD_NAME.VALIDATION_STATUS,
  viewBuilder: buildValidationStatus,
};

const VERSION: CommonControllerConfig = {
  inputProps: {
    isFullWidth: false,
    label: "Version",
    readOnly: true,
  },
  name: FIELD_NAME.VERSION,
};

export const GENERAL_INFO_SOURCE_DATASET_CONTROLLERS: (
  | ChipInputControllerConfig
  | CommonControllerConfig
)[] = [
  DOWNLOAD_NAME,
  VERSION,
  FILE_NAME,
  SIZE_BYTES,
  TITLE,
  CELL_COUNT,
  GENE_COUNT,
  VALIDATION_STATUS,
  CAP_INGEST_STATUS,
  PUBLICATION_STATUS,
  FILE_EVENT_TIME,
  PUBLISHED_AT,
];

export const CAP_SOURCE_DATASET_CONTROLLERS: CommonControllerConfig[] = [
  CAP_URL,
];
