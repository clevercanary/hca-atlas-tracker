import { AtlasSourceDatasetEditData } from "app/views/AtlasSourceDatasetView/common/entities";
import { HCAAtlasTrackerSourceDataset } from "../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FIELD_NAME } from "../../../../../../../../../views/AtlasSourceDatasetView/common/constants";
import { ControllerConfig } from "../../../../../../../../common/Form/components/Controllers/common/entities";

const METADATA_SPREADSHEET_URL: ControllerConfig<
  AtlasSourceDatasetEditData,
  HCAAtlasTrackerSourceDataset
> = {
  inputProps: {
    isFullWidth: true,
    label: "Metadata spreadsheet",
  },
  labelLink: true,
  name: FIELD_NAME.METADATA_SPREADSHEET_URL,
};

export const METADATA_VIEW_ATLAS_SOURCE_DATASET_CONTROLLERS: ControllerConfig<
  AtlasSourceDatasetEditData,
  HCAAtlasTrackerSourceDataset
>[] = [METADATA_SPREADSHEET_URL];
