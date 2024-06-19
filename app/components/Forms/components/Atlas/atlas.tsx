import { Fragment, ReactNode } from "react";
import { FieldValues } from "react-hook-form";
import { HCAAtlasTrackerAtlas } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormMethod } from "../../../../hooks/useForm/common/entities";
import { FormManager as FormManagerProps } from "../../../../hooks/useFormManager/common/entities";
import { FormManager } from "../../../common/Form/components/FormManager/formManager";
import { Divider } from "../../../Detail/components/TrackerForm/components/Divider/divider.styles";
import { TrackerFormSection as Section } from "../../../Detail/components/TrackerForm/components/Section/components/TrackerFormSection/trackerFormSection";
import { TrackerForm } from "../../../Detail/components/TrackerForm/trackerForm";
import { SectionConfig } from "../../common/entities";

interface AtlasFormProps<T extends FieldValues> {
  accessFallback: ReactNode;
  formManager: FormManagerProps;
  formMethod: FormMethod<T, HCAAtlasTrackerAtlas>;
  sectionConfigs: SectionConfig<T, HCAAtlasTrackerAtlas>[];
}

export const AtlasForm = <T extends FieldValues>({
  accessFallback,
  formManager,
  formMethod,
  sectionConfigs,
}: AtlasFormProps<T>): JSX.Element => {
  if (accessFallback) return <Fragment>{accessFallback}</Fragment>;
  return (
    <TrackerForm>
      <FormManager {...formManager} />
      {sectionConfigs.map(({ showDivider, ...sectionConfig }, i) => (
        <Fragment key={i}>
          {(i !== 0 || showDivider) && <Divider />}
          <Section<T, HCAAtlasTrackerAtlas>
            formManager={formManager}
            formMethod={formMethod}
            {...sectionConfig}
          />
        </Fragment>
      ))}
    </TrackerForm>
  );
};
