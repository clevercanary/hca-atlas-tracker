import { DialogTitle } from "@databiosphere/findable-ui/lib/components/common/Dialog/components/DialogTitle/dialogTitle";
import {
  DialogActions as MDialogActions,
  DialogContent as MDialogContent,
} from "@mui/material";
import { JSX, Fragment, ReactNode } from "react";
import { FieldValues } from "react-hook-form";
import { FormMethod } from "../../../../../../../hooks/useForm/common/entities";
import { FormManager } from "../../../../../../../hooks/useFormManager/common/entities";

export interface DialogBodyProps<T extends FieldValues, R = undefined> {
  actions?: ({
    className,
    formManager,
  }: {
    className?: string;
    formManager: FormManager;
  }) => ReactNode;
  content?: ({
    formManager,
    formMethod,
  }: {
    formManager: FormManager;
    formMethod: FormMethod<T, R>;
  }) => ReactNode;
  formManager: FormManager;
  formMethod: FormMethod<T, R>;
  onClose: () => void;
  title: ReactNode;
}

export const DialogBody = <T extends FieldValues, R = undefined>({
  actions,
  content,
  formManager,
  formMethod,
  onClose,
  title,
}: DialogBodyProps<T, R>): JSX.Element => {
  return (
    <Fragment>
      <DialogTitle title={title} onClose={onClose} />
      <MDialogContent dividers>
        {content?.({ formManager, formMethod })}
      </MDialogContent>
      <MDialogActions disableSpacing>
        {actions?.({ formManager })}
      </MDialogActions>
    </Fragment>
  );
};
