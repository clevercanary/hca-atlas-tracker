import { HCAAtlasTrackerComponentAtlas } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormMethod } from "../../../../hooks/useForm/common/entities";
import { FormManager as FormManagerProps } from "../../../../hooks/useFormManager/common/entities";
import { ComponentAtlasEditData } from "../../../../views/ComponentAtlasView/common/entities";
import { FormManager } from "../../../common/Form/components/FormManager/formManager";
import { Divider } from "../TrackerForm/components/Divider/divider.styles";
import { GeneralInfo } from "../TrackerForm/components/Section/components/ComponentAtlas/components/View/components/GeneralInfo/generalInfo";
import { TrackerForm } from "../TrackerForm/trackerForm";
import { RequestAccess } from "./components/RequestAccess/requestAccess";

interface ViewComponentAtlasProps {
  formManager: FormManagerProps;
  formMethod: FormMethod<ComponentAtlasEditData, HCAAtlasTrackerComponentAtlas>;
}

export const ViewComponentAtlas = ({
  formManager,
  formMethod,
}: ViewComponentAtlasProps): JSX.Element => {
  const {
    access: { canView },
  } = formManager;
  if (!canView) return <RequestAccess />;
  return (
    <TrackerForm>
      <FormManager {...formManager} />
      <Divider />
      <GeneralInfo formManager={formManager} formMethod={formMethod} />
    </TrackerForm>
  );
};
