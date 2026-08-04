import { type HCAAtlasTrackerSourceDataset } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type ControllerConfig } from "@/app/components/common/Form/components/Controllers/common/entities";
import { PublicationStatus } from "@/app/components/Form/components/Select/components/PublicationStatus/publicationStatus";
import { type PublicationStatusEditData } from "./entities";
import { FIELD_NAME } from "./fields";

type CommonControllerConfig = ControllerConfig<
  PublicationStatusEditData,
  HCAAtlasTrackerSourceDataset
>;

export const PUBLICATION_STATUS: CommonControllerConfig = {
  name: FIELD_NAME.PUBLICATION_STATUS,
  selectProps: {
    SelectComponent: PublicationStatus,
    displayEmpty: true,
    label: "Study Status",
  },
};
