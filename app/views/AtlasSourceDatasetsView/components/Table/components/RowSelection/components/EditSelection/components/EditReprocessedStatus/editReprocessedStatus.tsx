import { DialogTitle } from "@databiosphere/findable-ui/lib/components/common/Dialog/components/DialogTitle/dialogTitle";
import { useDialog } from "@databiosphere/findable-ui/lib/components/common/Dialog/hooks/useDialog";
import { MenuItem } from "@databiosphere/findable-ui/lib/components/common/DropdownMenu/components/MenuItem/menuItem";
import { DialogActions, DialogContent } from "@mui/material";
import { Fragment } from "react";
import { StyledDialog } from "../../../../../../../../../../components/common/Dialog/dialog.styles";
import { Controllers } from "../../../../../../../../../../components/common/Form/components/Controllers/controllers";
import { FormActions } from "../../../../../../../../../../components/common/Form/components/FormActions/formActions";
import { TrackerForm } from "../../../../../../../../../../components/Detail/components/TrackerForm/trackerForm";
import { REPROCESSED_STATUS } from "./common/controllers";
import { ReprocessedStatusEditData } from "./common/entities";
import { FIELD_NAME } from "./common/fields";
import { DIALOG_PROPS } from "./constants";
import { Props } from "./entities";
import { useEditReprocessedStatusForm } from "./hooks/useEditReprocessedStatusForm";
import { useEditReprocessedStatusFormManager } from "./hooks/useEditReprocessedStatusFormManager";

export const EditReprocessedStatus = (props: Props): JSX.Element | null => {
  const { onClose, onOpen, open } = useDialog();
  const { closeMenu, rows, table } = props;

  const formMethod = useEditReprocessedStatusForm();
  const formManager = useEditReprocessedStatusFormManager(
    formMethod,
    onClose,
    table
  );

  return (
    <Fragment>
      <MenuItem
        onClick={() => {
          onOpen();
          // Set the selected source dataset IDs.
          formMethod.setValue(
            FIELD_NAME.SOURCE_DATASET_IDS,
            rows.map((row) => row.id)
          );
        }}
      >
        Reprocessed Status
      </MenuItem>
      <StyledDialog
        {...DIALOG_PROPS}
        open={open}
        onClose={onClose}
        onTransitionExited={closeMenu}
      >
        <TrackerForm>
          <DialogTitle title="Edit reprocessed status" onClose={onClose} />
          <DialogContent dividers>
            <Controllers<ReprocessedStatusEditData>
              controllerConfigs={[REPROCESSED_STATUS]}
              formManager={formManager}
              formMethod={formMethod}
            />
          </DialogContent>
          <DialogActions disableSpacing>
            <FormActions formManager={formManager} />
          </DialogActions>
        </TrackerForm>
      </StyledDialog>
    </Fragment>
  );
};
