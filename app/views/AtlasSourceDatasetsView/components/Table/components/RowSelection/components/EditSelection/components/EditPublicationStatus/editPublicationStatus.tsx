import { DialogTitle } from "@databiosphere/findable-ui/lib/components/common/Dialog/components/DialogTitle/dialogTitle";
import { useDialog } from "@databiosphere/findable-ui/lib/components/common/Dialog/hooks/useDialog";
import { MenuItem } from "@databiosphere/findable-ui/lib/components/common/DropdownMenu/components/MenuItem/menuItem";
import { DialogActions, DialogContent } from "@mui/material";
import { Fragment } from "react";
import { StyledDialog } from "../../../../../../../../../../components/common/Dialog/dialog.styles";
import { Controllers } from "../../../../../../../../../../components/common/Form/components/Controllers/controllers";
import { FormActions } from "../../../../../../../../../../components/common/Form/components/FormActions/formActions";
import { TrackerForm } from "../../../../../../../../../../components/Detail/components/TrackerForm/trackerForm";
import { PUBLICATION_STATUS } from "./common/controllers";
import { PublicationStatusEditData } from "./common/entities";
import { FIELD_NAME } from "./common/fields";
import { DIALOG_PROPS } from "./constants";
import { Props } from "./entities";
import { useEditPublicationStatusForm } from "./hooks/useEditPublicationStatusForm";
import { useEditPublicationStatusFormManager } from "./hooks/useEditPublicationStatusManager";

export const EditPublicationStatus = (props: Props): JSX.Element | null => {
  const { onClose, onOpen, open } = useDialog();
  const { closeMenu, rows, table } = props;

  const formMethod = useEditPublicationStatusForm();
  const formManager = useEditPublicationStatusFormManager(
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
        Edit Publication Status
      </MenuItem>
      <StyledDialog
        {...DIALOG_PROPS}
        open={open}
        onClose={onClose}
        onTransitionExited={closeMenu}
      >
        <TrackerForm>
          <DialogTitle title="Edit Publication Status" onClose={onClose} />
          <DialogContent dividers>
            <Controllers<PublicationStatusEditData>
              controllerConfigs={[PUBLICATION_STATUS]}
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
