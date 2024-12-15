import { HCAAtlasTrackerSourceDataset } from "app/apis/catalog/hca-atlas-tracker/common/entities";
import { ControllerConfig } from "../../../../../../../../common/Form/components/Controllers/common/entities";
import { NewSourceDatasetData } from "../../../../../../AddSourceDataset/common/entities";
import { FIELD_NAME } from "../../../../../../ViewSourceDataset/common/constants";
import { SourceDatasetEditData } from "../../../../../../ViewSourceDataset/common/entities";

type CommonControllerConfig = ControllerConfig<
  NewSourceDatasetData | SourceDatasetEditData
>;

const TITLE: CommonControllerConfig = {
  inputProps: {
    label: "Title",
  },
  name: FIELD_NAME.TITLE,
};

export const GENERAL_INFO_NEW_SOURCE_DATASET_CONTROLLERS: ControllerConfig<
  NewSourceDatasetData,
  HCAAtlasTrackerSourceDataset
>[] = [TITLE];

export const GENERAL_INFO_VIEW_SOURCE_DATASET_CONTROLLERS: ControllerConfig<
  SourceDatasetEditData,
  HCAAtlasTrackerSourceDataset
>[] = GENERAL_INFO_NEW_SOURCE_DATASET_CONTROLLERS;
