import { type FormMethod } from "@/app/hooks/useForm/common/entities";
import { type FormManager } from "@/app/hooks/useFormManager/common/entities";
import { DialogTitle } from "@databiosphere/findable-ui/lib/components/common/Dialog/components/DialogTitle/dialogTitle";
import {
  DialogActions as MDialogActions,
  DialogContent as MDialogContent,
} from "@mui/material";
import { Fragment, type JSX, type ReactNode } from "react";
import { type FieldValues } from "react-hook-form";

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
