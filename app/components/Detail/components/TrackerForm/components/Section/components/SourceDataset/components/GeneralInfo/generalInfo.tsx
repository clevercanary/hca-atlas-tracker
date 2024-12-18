import { ReactNode } from "react";
import { FieldValues } from "react-hook-form";
import { ObjectSchema } from "yup";
import { HCAAtlasTrackerSourceDataset } from "../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../../../../../../../../../common/entities";
import { MapSchemaValuesFn } from "../../../../../../../../../../hooks/useForm/common/entities";
import { ControllerConfig } from "../../../../../../../../../common/Form/components/Controllers/common/entities";
import { Controllers } from "../../../../../../../../../common/Form/components/Controllers/controllers";
import {
  DialogBody,
  DialogBodyProps,
} from "../../../../../../../../../common/Form/components/Dialog/components/DialogBody/dialogBody";
import { FormActions } from "../../../../../../../../../common/Form/components/FormActions/formActions";
import { TrackerForm } from "../../../../../../trackerForm";
import { useSourceDatasetForm } from "../../hooks/useSourceDatasetForm";
import { useSourceDatasetFormManager } from "../../hooks/useSourceDatasetFormManager";

export interface GeneralInfoProps<T extends FieldValues> {
  actions?: DialogBodyProps<T, HCAAtlasTrackerSourceDataset>["actions"];
  apiData?: HCAAtlasTrackerSourceDataset;
  canDelete?: boolean;
  controllerConfigs: ControllerConfig<T, HCAAtlasTrackerSourceDataset>[];
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
  controllerConfigs,
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
  return (
    <TrackerForm>
      <DialogBody<T, HCAAtlasTrackerSourceDataset>
        actions={actions}
        content={({ formManager, formMethod }): JSX.Element => (
          <Controllers
            controllerConfigs={controllerConfigs}
            formManager={formManager}
            formMethod={formMethod}
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
