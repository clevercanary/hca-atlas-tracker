import { type HCAAtlasTrackerSourceStudy } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { FormManager } from "@/app/components/common/Form/components/FormManager/formManager";
import { Divider } from "@/app/components/Detail/components/TrackerForm/components/Divider/divider.styles";
import { GeneralInfo } from "@/app/components/Detail/components/TrackerForm/components/Section/components/SourceStudy/components/View/components/GeneralInfo/generalInfo";
import { Identifiers } from "@/app/components/Detail/components/TrackerForm/components/Section/components/SourceStudy/components/View/components/Identifiers/identifiers";
import { Metadata } from "@/app/components/Detail/components/TrackerForm/components/Section/components/SourceStudy/components/View/components/Metadata/metadata";
import { TrackerForm } from "@/app/components/Detail/components/TrackerForm/trackerForm";
import { type FormMethod } from "@/app/hooks/useForm/common/entities";
import { type FormManager as FormManagerProps } from "@/app/hooks/useFormManager/common/entities";
import { type SourceStudyEditData } from "@/app/views/SourceStudyView/common/entities";
import { type JSX } from "react";

interface ViewSourceStudyProps {
  formManager: FormManagerProps;
  formMethod: FormMethod<SourceStudyEditData, HCAAtlasTrackerSourceStudy>;
}

export const ViewSourceStudy = ({
  formManager,
  formMethod,
}: ViewSourceStudyProps): JSX.Element => {
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
