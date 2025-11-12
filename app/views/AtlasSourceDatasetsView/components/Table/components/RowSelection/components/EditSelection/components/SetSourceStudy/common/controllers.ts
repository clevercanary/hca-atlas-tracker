import { HCAAtlasTrackerSourceDataset } from "../../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { ControllerConfig } from "../../../../../../../../../../../components/common/Form/components/Controllers/common/entities";
import { SourceStudy } from "../../../../../../../../../../../components/Form/components/Select/components/SourceStudy/sourceStudy";
import { SourceStudyEditData } from "./entities";
import { FIELD_NAME } from "./fields";

type CommonControllerConfig = ControllerConfig<
  SourceStudyEditData,
  HCAAtlasTrackerSourceDataset
>;

export const SOURCE_STUDY: CommonControllerConfig = {
  name: FIELD_NAME.SOURCE_STUDY_ID,
  selectProps: {
    SelectComponent: SourceStudy,
    displayEmpty: true,
    label: "Source Study",
  },
};
