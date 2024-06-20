import { HCAAtlasTrackerSourceStudy } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormMethod } from "../../../../hooks/useForm/common/entities";
import { FormManager as FormManagerProps } from "../../../../hooks/useFormManager/common/entities";
import { NewSourceStudyData } from "../../../../views/AddNewSourceStudyView/common/entities";
import { GeneralInfo } from "../TrackerForm/components/Section/components/SourceStudy/components/Add/components/GeneralInfo/generalInfo";
import { TrackerForm } from "../TrackerForm/trackerForm";

interface AddSourceStudyProps {
  formManager: FormManagerProps;
  formMethod: FormMethod<NewSourceStudyData, HCAAtlasTrackerSourceStudy>;
}

export const AddSourceStudy = ({
  formManager,
  formMethod,
}: AddSourceStudyProps): JSX.Element => {
  return (
    <TrackerForm>
      <GeneralInfo formManager={formManager} formMethod={formMethod} />
    </TrackerForm>
  );
};
