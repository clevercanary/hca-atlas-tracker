import React, { ReactNode } from "react";
import { FieldValues } from "react-hook-form";
import { FormMethod } from "../../../hooks/useForm/common/entities";
import { FormManager } from "../../../hooks/useFormManager/common/entities";
import { TrackerFormSectionProps } from "../../Detail/components/TrackerForm/components/Section/components/TrackerFormSection/trackerFormSection";

export interface SectionConfig<T extends FieldValues, R = undefined>
  extends Omit<TrackerFormSectionProps<T, R>, "formManager" | "formMethod"> {
  showDivider?: boolean;
}

export interface SectionContentProps<T extends FieldValues, R = undefined> {
  children: ReactNode;
  formManager: FormManager;
  formMethod: FormMethod<T, R>;
  fullWidth?: boolean;
}

export type SectionContent<
  T extends FieldValues,
  R = undefined
> = React.FunctionComponent<SectionContentProps<T, R>>;
