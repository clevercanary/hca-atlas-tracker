import { type API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { type HCAAtlasTrackerValidationRecord } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type METHOD } from "@/app/common/entities";
import { type FormActionsProps } from "@/app/components/common/Form/components/FormActions/formActions";
import {
  type FormMethod,
  type MapApiValuesFn,
} from "@/app/hooks/useForm/common/entities";
import { type ReactNode } from "react";
import { type FieldValues } from "react-hook-form";
import { type ObjectSchema } from "yup";

export interface ContentProps<
  T extends FieldValues,
  R extends HCAAtlasTrackerValidationRecord[] =
    HCAAtlasTrackerValidationRecord[],
> {
  formMethod: FormMethod<T, R>;
  taskIds: string[];
}

export interface DialogFormValue<
  T extends FieldValues,
  R extends HCAAtlasTrackerValidationRecord[] =
    HCAAtlasTrackerValidationRecord[],
> {
  dialog: {
    actions?: ({ className, formManager }: FormActionsProps) => ReactNode;
    content?: ({ formMethod, taskIds }: ContentProps<T, R>) => ReactNode;
    title: ReactNode;
  };
  formManager: {
    requestMethod: METHOD | undefined;
    requestURL: API | undefined;
  };
  formMethod: {
    mapApiValues?: MapApiValuesFn<T>;
    schema: ObjectSchema<T>;
  };
}

export type OnEditFn<
  T extends FieldValues,
  R extends HCAAtlasTrackerValidationRecord[] =
    HCAAtlasTrackerValidationRecord[],
> = (formValue: DialogFormValue<T, R>) => void;
