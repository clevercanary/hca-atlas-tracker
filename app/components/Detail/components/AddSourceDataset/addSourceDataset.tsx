import { FormMethod } from "../../../../hooks/useForm/common/entities";
import { FormManager as FormManagerProps } from "../../../../hooks/useFormManager/common/entities";
import { NewSourceDatasetData } from "../../../../views/AddNewSourceDatasetView/common/entities";
import { FormManager } from "../../../common/Form/components/FormManager/formManager";
import { Divider } from "../TrackerForm/components/Divider/divider.styles";
import { GeneralInfo } from "../TrackerForm/components/Section/components/SourceDataset/components/Add/components/GeneralInfo/generalInfo";
import { TrackerForm } from "../TrackerForm/trackerForm";
import { RequestAccess } from "./components/RequestAccess/requestAccess";

interface AddSourceDatasetProps {
  formManager: FormManagerProps;
  formMethod: FormMethod<NewSourceDatasetData>;
}

export const AddSourceDataset = ({
  formManager,
  formMethod,
}: AddSourceDatasetProps): JSX.Element => {
  const {
    access: { canView },
  } = formManager;
  if (!canView) return <RequestAccess />;
  return (
    <TrackerForm>
      <FormManager {...formManager} />
      <Divider />
      <GeneralInfo formMethod={formMethod} />
    </TrackerForm>
  );
};
