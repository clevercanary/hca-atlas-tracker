import { TrackerFormSectionProps } from "@/app/components/Detail/components/TrackerForm/components/Section/components/TrackerFormSection/trackerFormSection";
import { FormMethod } from "@/app/hooks/useForm/common/entities";
import { FormManager } from "@/app/hooks/useFormManager/common/entities";
import { PaperProps } from "@mui/material";
import React, { ElementType, ReactNode } from "react";
import { FieldValues } from "react-hook-form";

export interface SectionConfig<
  T extends FieldValues,
  R = undefined,
  C extends ElementType = "input",
> extends Omit<TrackerFormSectionProps<T, R, C>, "formManager" | "formMethod"> {
  showDivider?: boolean;
}

export interface SectionContentProps<T extends FieldValues, R = undefined> {
  children: ReactNode;
  elevation?: PaperProps["elevation"];
  formManager: FormManager;
  formMethod: FormMethod<T, R>;
  fullWidth?: boolean;
}

export type SectionContent<
  T extends FieldValues,
  R = undefined,
> = React.FunctionComponent<SectionContentProps<T, R>>;
