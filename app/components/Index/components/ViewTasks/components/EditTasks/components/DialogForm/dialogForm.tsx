import { DialogTitle } from "@databiosphere/findable-ui/lib/components/common/Dialog/components/DialogTitle/dialogTitle";
import {
  DialogActions as MDialogActions,
  DialogContent as MDialogContent,
} from "@mui/material";
import { FieldValues } from "react-hook-form";
import { object, ObjectSchema } from "yup";
import { HCAAtlasTrackerValidationRecord } from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { TrackerForm } from "../../../../../../../Detail/components/TrackerForm/trackerForm";
import { DialogFormValue } from "../../common/entities";
import { useEditTasksForm } from "../../hooks/useEditTasksForm";
import { useEditTasksFormManager } from "../../hooks/useEditTasksFormManager";

export interface DialogFormProps<
  T extends FieldValues,
  R extends HCAAtlasTrackerValidationRecord[] =
    HCAAtlasTrackerValidationRecord[],
> {
  formValue?: DialogFormValue<T, R>;
  onClose: () => void;
  taskIds: string[];
}

export const DialogForm = <
  T extends FieldValues,
  R extends HCAAtlasTrackerValidationRecord[] =
    HCAAtlasTrackerValidationRecord[],
>({
  formValue,
  onClose,
  taskIds,
}: DialogFormProps<T, R>): JSX.Element => {
  const {
    dialog: { actions, content, title },
    formManager: { requestMethod, requestURL },
    formMethod: { mapApiValues, schema = object({}) as ObjectSchema<T> },
  } = formValue || { dialog: {}, formManager: {}, formMethod: {} };
  const formMethod = useEditTasksForm<T, R>(schema, mapApiValues);
  const formManager = useEditTasksFormManager<T, R>(
    formMethod,
    onClose,
    requestURL,
    requestMethod,
  );
  return (
    <TrackerForm>
      <DialogTitle title={title} onClose={onClose} />
      <MDialogContent dividers>
        {content?.({ formMethod, taskIds })}
      </MDialogContent>
      <MDialogActions disableSpacing>
        {actions?.({ formManager })}
      </MDialogActions>
    </TrackerForm>
  );
};
