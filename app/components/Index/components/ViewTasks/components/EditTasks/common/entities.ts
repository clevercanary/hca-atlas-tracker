import { ReactNode } from "react";
import { FieldValues } from "react-hook-form";
import { ObjectSchema } from "yup";
import { API } from "../../../../../../../apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerValidationRecord } from "../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../../../../../../common/entities";
import {
  FormMethod,
  MapApiValuesFn,
} from "../../../../../../../hooks/useForm/common/entities";
import { FormActionsProps } from "../../../../../../common/Form/components/FormActions/formActions";

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
