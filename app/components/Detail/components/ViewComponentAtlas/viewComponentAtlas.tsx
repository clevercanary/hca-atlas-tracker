import {
  HCAAtlasTrackerComponentAtlas,
  HCAAtlasTrackerSourceDataset,
} from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../../common/entities";
import { FormMethod } from "../../../../hooks/useForm/common/entities";
import { FormManager as FormManagerProps } from "../../../../hooks/useFormManager/common/entities";
import { ComponentAtlasEditData } from "../../../../views/ComponentAtlasView/common/entities";
import { FormManager } from "../../../common/Form/components/FormManager/formManager";
import { Divider } from "../TrackerForm/components/Divider/divider.styles";
import { GENERAL_INFO_VIEW_COMPONENT_ATLAS_CONTROLLERS } from "../TrackerForm/components/Section/components/ComponentAtlas/common/constants";
import { GeneralInfo } from "../TrackerForm/components/Section/components/ComponentAtlas/components/GeneralInfo/generalInfo";
import { LinkedSourceDatasets } from "../TrackerForm/components/Section/components/ComponentAtlas/components/LinkedSourceDatasets/linkedSourceDatasets";
import { TrackerForm } from "../TrackerForm/trackerForm";
import { RequestAccess } from "./components/RequestAccess/requestAccess";

interface ViewComponentAtlasProps {
  componentAtlasSourceDatasets?: HCAAtlasTrackerSourceDataset[];
  formManager: FormManagerProps;
  formMethod: FormMethod<ComponentAtlasEditData, HCAAtlasTrackerComponentAtlas>;
  pathParameter: PathParameter;
  sourceStudiesSourceDatasets?: HCAAtlasTrackerSourceDataset[];
}

export const ViewComponentAtlas = ({
  componentAtlasSourceDatasets = [],
  formManager,
  formMethod,
  pathParameter,
  sourceStudiesSourceDatasets = [],
}: ViewComponentAtlasProps): JSX.Element => {
  const {
    access: { canView },
  } = formManager;
  if (!canView) return <RequestAccess />;
  return (
    <TrackerForm>
      <FormManager {...formManager} />
      <Divider />
      <GeneralInfo<ComponentAtlasEditData>
        controllerConfigs={GENERAL_INFO_VIEW_COMPONENT_ATLAS_CONTROLLERS}
        formManager={formManager}
        formMethod={formMethod}
      />
      <Divider />
      <LinkedSourceDatasets
        componentAtlasSourceDatasets={componentAtlasSourceDatasets}
        formManager={formManager}
        pathParameter={pathParameter}
        sourceStudiesSourceDatasets={sourceStudiesSourceDatasets}
      />
    </TrackerForm>
  );
};
