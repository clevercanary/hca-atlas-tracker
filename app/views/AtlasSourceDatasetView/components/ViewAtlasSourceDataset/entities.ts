import { ReactNode } from "react";
import { HCAAtlasTrackerSourceDataset } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormMethod } from "../../../../hooks/useForm/common/entities";
import { FormManager as FormManagerProps } from "../../../../hooks/useFormManager/common/entities";
import { ViewAtlasSourceDatasetData } from "../../common/entities";
import { SourceDatasetSectionConfig } from "../../common/sections";

export interface ViewAtlasSourceDatasetProps {
  accessFallback: ReactNode;
  formManager: FormManagerProps;
  formMethod: FormMethod<
    ViewAtlasSourceDatasetData,
    HCAAtlasTrackerSourceDataset
  >;
  sectionConfigs: SourceDatasetSectionConfig[];
}
