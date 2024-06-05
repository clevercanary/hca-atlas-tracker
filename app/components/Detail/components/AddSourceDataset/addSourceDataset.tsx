import { HCAAtlasTrackerSourceStudy } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormMethod } from "../../../../hooks/useForm/common/entities";
import { FormManager as FormManagerProps } from "../../../../hooks/useFormManager/common/entities";
import { NewSourceDatasetData } from "../../../../views/AddNewSourceDatasetView/common/entities";
import { FormManager } from "../../../common/Form/components/FormManager/formManager";
import { Divider } from "../TrackerForm/components/Divider/divider.styles";
import { GeneralInfo } from "../TrackerForm/components/Section/components/SourceDataset/components/Add/components/GeneralInfo/generalInfo";
import { TrackerForm } from "../TrackerForm/trackerForm";
import { NoAccess } from "./components/NoAccess/noAccess";
import { RequestAccess } from "./components/RequestAccess/requestAccess";

interface AddSourceDatasetProps {
  formManager: FormManagerProps;
  formMethod: FormMethod<NewSourceDatasetData, HCAAtlasTrackerSourceStudy>;
}

export const AddSourceDataset = ({
  formManager,
  formMethod,
}: AddSourceDatasetProps): JSX.Element => {
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
