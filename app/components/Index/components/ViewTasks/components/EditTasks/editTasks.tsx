import {
  type HCAAtlasTrackerListValidationRecord,
  type HCAAtlasTrackerValidationRecord,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { StyledDialog } from "@/app/components/common/Dialog/dialog.styles";
import { DropdownMenu } from "@databiosphere/findable-ui/lib/components/Table/components/TableToolbar/components/RowSelection/components/DropdownMenu/dropdownMenu";
import { type Row } from "@tanstack/react-table";
import { Fragment, type JSX, useCallback, useMemo, useState } from "react";
import { type FieldValues } from "react-hook-form";
import { type DialogFormValue } from "./common/entities";
import { DialogForm } from "./components/DialogForm/dialogForm";
import { type TaskCompletionDatesData } from "./components/EditTargetCompletion/common/entities";
import { EditTargetCompletion } from "./components/EditTargetCompletion/editTargetCompletion";

export interface EditTasksProps {
  rows: Row<HCAAtlasTrackerListValidationRecord>[];
}

export const EditTasks = <
  T extends FieldValues,
  R extends HCAAtlasTrackerValidationRecord[] =
    HCAAtlasTrackerValidationRecord[],
>({
  rows,
}: EditTasksProps): JSX.Element => {
  const [open, setOpen] = useState<boolean>(false);
  const [formValue, setFormValue] = useState<DialogFormValue<T, R>>();
  const taskIds = useMemo(() => getTaskIds(rows), [rows]);

  const onEdit = (
    closeMenu: () => void,
    formValue: DialogFormValue<T, R>,
  ): void => {
    closeMenu();
    setOpen(true);
    setFormValue(formValue);
  };

  const onClose = useCallback((): void => {
    setOpen(false);
  }, []);

  return (
    <Fragment>
      <DropdownMenu>
        {({ closeMenu }): JSX.Element[] => [
          <EditTargetCompletion
            key="target-completion"
            onEdit={(
              formValue: DialogFormValue<TaskCompletionDatesData>,
            ): void =>
              onEdit(closeMenu, formValue as unknown as DialogFormValue<T, R>)
            }
          />,
        ]}
      </DropdownMenu>
      <StyledDialog maxWidth={false} open={open} onClose={onClose}>
        <DialogForm formValue={formValue} onClose={onClose} taskIds={taskIds} />
      </StyledDialog>
    </Fragment>
  );
};

/**
 * Returns the task IDs from the selected rows.
 * @param rows - Selected rows.
 * @returns task IDs.
 */
function getTaskIds(
  rows: Row<HCAAtlasTrackerListValidationRecord>[],
): string[] {
  return rows.map((row) => row.id);
}
