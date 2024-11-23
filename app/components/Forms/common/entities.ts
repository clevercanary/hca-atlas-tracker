import React, { ElementType } from "react";
import { FieldValues } from "react-hook-form";
import { FormMethod } from "../../../hooks/useForm/common/entities";
import { FormManager } from "../../../hooks/useFormManager/common/entities";
import { TrackerFormSectionProps } from "../../Detail/components/TrackerForm/components/Section/components/TrackerFormSection/trackerFormSection";

export interface SectionConfig<T extends FieldValues, R = undefined>
  extends Omit<TrackerFormSectionProps<T, R>, "formManager" | "formMethod"> {
  showDivider?: boolean;
}

export interface SectionControllersProps<T extends FieldValues, R = undefined> {
  formManager: FormManager;
  formMethod: FormMethod<T, R>;
  fullWidth: boolean;
  SectionCard: ElementType;
}

export type SectionControllers<
  T extends FieldValues,
  R = undefined
> = React.FunctionComponent<SectionControllersProps<T, R>>;
