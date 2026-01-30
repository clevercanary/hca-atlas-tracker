import { JSX } from "react";
import { HCAAtlasTrackerSourceStudy } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormMethod } from "../../../../hooks/useForm/common/entities";
import { FormManager as FormManagerProps } from "../../../../hooks/useFormManager/common/entities";
import { SourceStudyEditData } from "../../../../views/SourceStudyView/common/entities";
import { FormManager } from "../../../common/Form/components/FormManager/formManager";
import { Divider } from "../TrackerForm/components/Divider/divider.styles";
import { GeneralInfo } from "../TrackerForm/components/Section/components/SourceStudy/components/View/components/GeneralInfo/generalInfo";
import { Identifiers } from "../TrackerForm/components/Section/components/SourceStudy/components/View/components/Identifiers/identifiers";
import { Metadata } from "../TrackerForm/components/Section/components/SourceStudy/components/View/components/Metadata/metadata";
import { TrackerForm } from "../TrackerForm/trackerForm";
import { RequestAccess } from "./components/RequestAccess/requestAccess";

interface ViewSourceStudyProps {
  formManager: FormManagerProps;
  formMethod: FormMethod<SourceStudyEditData, HCAAtlasTrackerSourceStudy>;
}

export const ViewSourceStudy = ({
  formManager,
  formMethod,
}: ViewSourceStudyProps): JSX.Element => {
  const {
    access: { canView },
  } = formManager;
  if (!canView) return <RequestAccess />;
  return (
    <TrackerForm>
      <FormManager {...formManager} />
      <GeneralInfo formManager={formManager} formMethod={formMethod} />
      <Divider />
      <Metadata formManager={formManager} formMethod={formMethod} />
      <Divider />
      <Identifiers formManager={formManager} formMethod={formMethod} />
    </TrackerForm>
  );
};
