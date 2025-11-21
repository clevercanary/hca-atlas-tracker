import { HCAAtlasTrackerSourceDataset } from "../../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { ControllerConfig } from "../../../../../../../../../../../components/common/Form/components/Controllers/common/entities";
import { PublicationStatus } from "../../../../../../../../../../../components/Form/components/Select/components/PublicationStatus/publicationStatus";
import { PublicationStatusEditData } from "./entities";
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
    label: "Publication Status",
  },
};
