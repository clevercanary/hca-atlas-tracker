import { Divider } from "@/app/components/Detail/components/TrackerForm/components/Divider/divider.styles";
import { TrackerFormSection as Section } from "@/app/components/Detail/components/TrackerForm/components/Section/components/TrackerFormSection/trackerFormSection";
import { TrackerForm } from "@/app/components/Detail/components/TrackerForm/trackerForm";
import { SectionConfig } from "@/app/components/Forms/common/entities";
import { FormManager } from "@/app/components/common/Form/components/FormManager/formManager";
import { FormMethod } from "@/app/hooks/useForm/common/entities";
import { FormManager as FormManagerProps } from "@/app/hooks/useFormManager/common/entities";
import { ElementType, Fragment, JSX } from "react";
import { FieldValues } from "react-hook-form";

interface EntityFormProps<
  T extends FieldValues,
  R = undefined,
  C extends ElementType = "input",
> {
  formManager: FormManagerProps;
  formMethod: FormMethod<T, R>;
  sectionConfigs: SectionConfig<T, R, C>[];
}

export const EntityForm = <
  T extends FieldValues,
  R = undefined,
  C extends ElementType = "input",
>({
  formManager,
  formMethod,
  sectionConfigs,
}: EntityFormProps<T, R, C>): JSX.Element => {
  return (
    <TrackerForm>
      <FormManager {...formManager} />
      {sectionConfigs.map(({ showDivider, ...sectionConfig }, i) => (
        <Fragment key={i}>
          {(i !== 0 || showDivider) && <Divider />}
          <Section<T, R, C>
            formManager={formManager}
            formMethod={formMethod}
            {...sectionConfig}
          />
        </Fragment>
      ))}
    </TrackerForm>
  );
};
