import { JSX, ElementType, Fragment, ReactNode } from "react";
import { FieldValues } from "react-hook-form";
import { FormMethod } from "../../../../hooks/useForm/common/entities";
import { FormManager as FormManagerProps } from "../../../../hooks/useFormManager/common/entities";
import { Divider } from "../../../Detail/components/TrackerForm/components/Divider/divider.styles";
import { TrackerFormSection as Section } from "../../../Detail/components/TrackerForm/components/Section/components/TrackerFormSection/trackerFormSection";
import { TrackerForm } from "../../../Detail/components/TrackerForm/trackerForm";
import { SectionConfig } from "../../../Forms/common/entities";
import { FormManager } from "../../../common/Form/components/FormManager/formManager";

interface EntityFormProps<
  T extends FieldValues,
  R = undefined,
  C extends ElementType = "input",
> {
  accessFallback: ReactNode;
  formManager: FormManagerProps;
  formMethod: FormMethod<T, R>;
  sectionConfigs: SectionConfig<T, R, C>[];
}

export const EntityForm = <
  T extends FieldValues,
  R = undefined,
  C extends ElementType = "input",
>({
  accessFallback,
  formManager,
  formMethod,
  sectionConfigs,
}: EntityFormProps<T, R, C>): JSX.Element => {
  if (accessFallback) return <Fragment>{accessFallback}</Fragment>;
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
