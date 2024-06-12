import { ControllerProps } from "../../../../../../../../common/Form/components/Controller/common/entities";
import { NewSourceDatasetData } from "../../../../../../AddSourceDataset/common/entities";
import { FIELD_NAME } from "../../../../../../ViewSourceDataset/common/constants";
import { SourceDatasetEditData } from "../../../../../../ViewSourceDataset/common/entities";

type CommonControllerProps = ControllerProps<
  NewSourceDatasetData | SourceDatasetEditData
>;

const TITLE: CommonControllerProps = {
  inputProps: {
    label: "Title",
  },
  name: FIELD_NAME.TITLE,
};

export const GENERAL_INFO_NEW_SOURCE_DATASET_CONTROLLERS: ControllerProps<NewSourceDatasetData>[] =
  [TITLE];

export const GENERAL_INFO_VIEW_SOURCE_DATASET_CONTROLLERS: ControllerProps<SourceDatasetEditData>[] =
  GENERAL_INFO_NEW_SOURCE_DATASET_CONTROLLERS;
