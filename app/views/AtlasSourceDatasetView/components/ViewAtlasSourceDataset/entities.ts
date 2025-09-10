import { ReactNode } from "react";
import { HCAAtlasTrackerSourceDataset } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { SectionConfig } from "../../../../components/Forms/common/entities";
import { FormMethod } from "../../../../hooks/useForm/common/entities";
import { FormManager as FormManagerProps } from "../../../../hooks/useFormManager/common/entities";
import { ViewAtlasSourceDatasetData } from "../../common/entities";

export interface ViewAtlasSourceDatasetProps {
  accessFallback: ReactNode;
  formManager: FormManagerProps;
  formMethod: FormMethod<
    ViewAtlasSourceDatasetData,
    HCAAtlasTrackerSourceDataset
  >;
  sectionConfigs: SectionConfig<
    ViewAtlasSourceDatasetData,
    HCAAtlasTrackerSourceDataset
  >[];
}
