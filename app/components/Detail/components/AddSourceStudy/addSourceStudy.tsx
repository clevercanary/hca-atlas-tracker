import { HCAAtlasTrackerSourceStudy } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormMethod } from "../../../../hooks/useForm/common/entities";
import { FormManager as FormManagerProps } from "../../../../hooks/useFormManager/common/entities";
import { NewSourceStudyData } from "../../../../views/AddNewSourceStudyView/common/entities";
import { FormManager } from "../../../common/Form/components/FormManager/formManager";
import { Divider } from "../TrackerForm/components/Divider/divider.styles";
import { GeneralInfo } from "../TrackerForm/components/Section/components/SourceStudy/components/Add/components/GeneralInfo/generalInfo";
import { TrackerForm } from "../TrackerForm/trackerForm";
import { NoAccess } from "./components/NoAccess/noAccess";
import { RequestAccess } from "./components/RequestAccess/requestAccess";

interface AddSourceStudyProps {
  formManager: FormManagerProps;
  formMethod: FormMethod<NewSourceStudyData, HCAAtlasTrackerSourceStudy>;
}

export const AddSourceStudy = ({
  formManager,
  formMethod,
}: AddSourceStudyProps): JSX.Element => {
  const {
    access: { canEdit, canView },
  } = formManager;
  if (!canView) return <RequestAccess />;
  if (!canEdit) return <NoAccess />;
  return (
    <TrackerForm>
      <FormManager {...formManager} />
      <Divider />
      <GeneralInfo formManager={formManager} formMethod={formMethod} />
    </TrackerForm>
  );
};
