import { ReactNode } from "react";
import { Controller, FieldValues, Path } from "react-hook-form";
import { ObjectSchema } from "yup";
import { HCAAtlasTrackerSourceDataset } from "../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../../../../../../../../../common/entities";
import {
  MapSchemaValuesFn,
  YupValidatedFormValues,
} from "../../../../../../../../../../hooks/useForm/common/entities";
import {
  DialogBody,
  DialogBodyProps,
} from "../../../../../../../../../common/Form/components/Dialog/components/DialogBody/dialogBody";
import { FormActions } from "../../../../../../../../../common/Form/components/FormActions/formActions";
import { Input } from "../../../../../../../../../common/Form/components/Input/input";
import { FIELD_NAME } from "../../../../../../../ViewSourceDataset/common/constants";
import { TrackerForm } from "../../../../../../trackerForm";
import { DEFAULT_INPUT_PROPS } from "../../common/constants";
import { useSourceDatasetForm } from "../../hooks/useSourceDatasetForm";
import { useSourceDatasetFormManager } from "../../hooks/useSourceDatasetFormManager";

export interface GeneralInfoProps<T extends FieldValues> {
  actions?: DialogBodyProps<T, HCAAtlasTrackerSourceDataset>["actions"];
  apiData?: HCAAtlasTrackerSourceDataset;
  canDelete?: boolean;
  mapSchemaValues?: MapSchemaValuesFn<T, HCAAtlasTrackerSourceDataset>;
  method: METHOD;
  onClose: () => void;
  requestUrl: string;
  schema: ObjectSchema<T>;
  title: ReactNode;
}

export const GeneralInfo = <T extends FieldValues>({
  actions = FormActions,
  apiData,
  canDelete = false,
  mapSchemaValues,
  method,
  onClose,
  requestUrl,
  schema,
  title,
}: GeneralInfoProps<T>): JSX.Element => {
  const formMethod = useSourceDatasetForm(schema, apiData, mapSchemaValues);
  const formManager = useSourceDatasetFormManager(
    onClose,
    formMethod,
    requestUrl,
    method,
    canDelete
  );
  const {
    formStatus: { isReadOnly },
  } = formManager;
  const { control } = formMethod;
  return (
    <TrackerForm>
      <DialogBody<T, HCAAtlasTrackerSourceDataset>
        actions={actions}
        content={(): JSX.Element => (
          <Controller
            control={control}
            name={FIELD_NAME.TITLE as Path<YupValidatedFormValues<T>>} // TODO(cc) resolve type assertion with generic controller component.
            render={({
              field,
              fieldState: { error, invalid },
            }): JSX.Element => (
              <Input
                {...field}
                {...DEFAULT_INPUT_PROPS.TITLE}
                error={invalid}
                helperText={error?.message}
                isFilled={Boolean(field.value)}
                readOnly={isReadOnly}
              />
            )}
          />
        )}
        formManager={formManager}
        formMethod={formMethod}
        onClose={onClose}
        title={title}
      />
    </TrackerForm>
  );
};
