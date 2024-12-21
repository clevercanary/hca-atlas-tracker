import { Fragment } from "react";
import { FieldValues } from "react-hook-form";
import { HCAAtlasTrackerSourceDataset } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../../common/entities";
import { FormMethod } from "../../../../hooks/useForm/common/entities";
import { FormManager as FormManagerProps } from "../../../../hooks/useFormManager/common/entities";
import { FormManager } from "../../../common/Form/components/FormManager/formManager";
import { SectionConfig } from "../../../Forms/common/entities";
import { Divider } from "../TrackerForm/components/Divider/divider.styles";
import { TrackerFormSection } from "../TrackerForm/components/Section/components/TrackerFormSection/trackerFormSection";
import { TrackerForm } from "../TrackerForm/trackerForm";
import { RequestAccess } from "./components/RequestAccess/requestAccess";

interface ViewAtlasSourceDatasetProps<T extends FieldValues> {
  formManager: FormManagerProps;
  formMethod: FormMethod<T, HCAAtlasTrackerSourceDataset>;
  pathParameter: PathParameter;
  sectionConfigs: SectionConfig<T, HCAAtlasTrackerSourceDataset>[];
}

export const ViewAtlasSourceDataset = <T extends FieldValues>({
  formManager,
  formMethod,
  sectionConfigs,
}: ViewAtlasSourceDatasetProps<T>): JSX.Element => {
  const {
    access: { canView },
  } = formManager;
  if (!canView) return <RequestAccess />;
  return (
    <TrackerForm>
      <FormManager {...formManager} />
      {sectionConfigs.map(({ showDivider, ...sectionConfig }, i) => (
        <Fragment key={i}>
          {(i !== 0 || showDivider) && <Divider />}
          <TrackerFormSection<T, HCAAtlasTrackerSourceDataset>
            formManager={formManager}
            formMethod={formMethod}
            {...sectionConfig}
          />
        </Fragment>
      ))}
    </TrackerForm>
  );
};
