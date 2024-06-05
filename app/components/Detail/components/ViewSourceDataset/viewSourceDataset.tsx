import { HCAAtlasTrackerSourceStudy } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormMethod } from "../../../../hooks/useForm/common/entities";
import { FormManager as FormManagerProps } from "../../../../hooks/useFormManager/common/entities";
import { PUBLICATION_STATUS } from "../../../../views/AddNewSourceDatasetView/common/entities";
import { SourceStudyEditData } from "../../../../views/SourceDatasetView/common/entities";
import { FormManager } from "../../../common/Form/components/FormManager/formManager";
import { Divider } from "../TrackerForm/components/Divider/divider.styles";
import { GeneralInfo } from "../TrackerForm/components/Section/components/SourceDataset/components/View/components/GeneralInfo/generalInfo";
import { Identifiers } from "../TrackerForm/components/Section/components/SourceDataset/components/View/components/Identifiers/identifiers";
import { TrackerForm } from "../TrackerForm/trackerForm";
import { RequestAccess } from "./components/RequestAccess/requestAccess";

interface ViewSourceStudyProps {
  formManager: FormManagerProps;
  formMethod: FormMethod<SourceStudyEditData, HCAAtlasTrackerSourceStudy>;
  sdPublicationStatus: PUBLICATION_STATUS;
}

export const ViewSourceStudy = ({
  formManager,
  formMethod,
  sdPublicationStatus,
}: ViewSourceStudyProps): JSX.Element => {
  const {
    access: { canView },
  } = formManager;
  const {
    formState: { isDirty },
  } = formMethod;
  if (!canView) return <RequestAccess />;
  return (
    <TrackerForm>
      {isDirty && <FormManager {...formManager} />}
      <Divider />
      <GeneralInfo
        formManager={formManager}
        formMethod={formMethod}
        sdPublicationStatus={sdPublicationStatus}
      />
      <Divider />
      <Identifiers formMethod={formMethod} />
    </TrackerForm>
  );
};
