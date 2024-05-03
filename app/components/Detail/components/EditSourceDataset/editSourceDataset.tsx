import { HCAAtlasTrackerSourceDataset } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormMethod } from "../../../../hooks/useForm/common/entities";
import { FormManager as FormManagerProps } from "../../../../hooks/useFormManager/common/entities";
import { PUBLICATION_STATUS } from "../../../../views/AddNewSourceDatasetView/common/entities";
import { SourceDatasetEditData } from "../../../../views/EditSourceDatasetView/common/entities";
import { FormManager } from "../../../common/Form/components/FormManager/formManager";
import { Divider } from "../TrackerForm/components/Divider/divider.styles";
import { GeneralInfo } from "../TrackerForm/components/Section/components/SourceDataset/components/Edit/components/GeneralInfo/generalInfo";
import { Identifiers } from "../TrackerForm/components/Section/components/SourceDataset/components/Edit/components/Identifiers/identifiers";
import { TrackerForm } from "../TrackerForm/trackerForm";
import { RequestAccess } from "./components/RequestAccess/requestAccess";

interface EditSourceDatasetProps {
  formManager: FormManagerProps;
  formMethod: FormMethod<SourceDatasetEditData, HCAAtlasTrackerSourceDataset>;
  sdPublicationStatus: PUBLICATION_STATUS;
}

export const EditSourceDataset = ({
  formManager,
  formMethod,
  sdPublicationStatus,
}: EditSourceDatasetProps): JSX.Element => {
  const {
    access: { canView },
  } = formManager;
  if (!canView) return <RequestAccess />;
  return (
    <TrackerForm>
      <FormManager {...formManager} />
      <Divider />
      <GeneralInfo
        formMethod={formMethod}
        sdPublicationStatus={sdPublicationStatus}
      />
      <Divider />
      <Identifiers formMethod={formMethod} />
    </TrackerForm>
  );
};
