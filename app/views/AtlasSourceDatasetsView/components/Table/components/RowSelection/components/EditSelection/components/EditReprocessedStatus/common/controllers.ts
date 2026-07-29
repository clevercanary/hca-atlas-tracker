import { HCAAtlasTrackerSourceDataset } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { ControllerConfig } from "@/app/components/common/Form/components/Controllers/common/entities";
import { ReprocessedStatus } from "@/app/components/Form/components/Select/components/ReprocessedStatus/reprocessedStatus";
import { ReprocessedStatusEditData } from "./entities";
import { FIELD_NAME } from "./fields";

type CommonControllerConfig = ControllerConfig<
  ReprocessedStatusEditData,
  HCAAtlasTrackerSourceDataset
>;

export const REPROCESSED_STATUS: CommonControllerConfig = {
  name: FIELD_NAME.REPROCESSED_STATUS,
  selectProps: {
    SelectComponent: ReprocessedStatus,
    displayEmpty: true,
    label: "Reprocessed Status",
  },
};
