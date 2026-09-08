import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { type HCAAtlasTrackerAtlas } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { getAtlasGenerationName } from "@/app/apis/catalog/hca-atlas-tracker/common/utils";
import { type PathParameter } from "@/app/common/entities";
import { getRequestURL, getRouteURL } from "@/app/common/utils";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@/app/components/common/ConfirmationDialog/confirmationDialog.styles";
import { TypographyError } from "@/app/components/common/Typography/components/TypographyError/typographyError";
import { useCreateAtlasRevision } from "@/app/hooks/UseCreateAtlasRevision/hook";
import { ROUTE } from "@/app/routes/constants";
import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/button";
import { Button, Typography } from "@mui/material";
import { type JSX } from "react";

interface Props {
  atlas: HCAAtlasTrackerAtlas | undefined;
  onCancel: () => void;
  open: boolean;
  pathParameter: PathParameter;
}

export const CreateRevisionDialog = ({
  atlas,
  onCancel,
  open,
  pathParameter,
}: Props): JSX.Element => {
  const {
    actions: { onDismissError, onSubmit },
    status: { error, isRequesting, succeeded },
  } = useCreateAtlasRevision();

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      // Undefined while the request is in flight, which blocks both escape and
      // the backdrop: MUI routes each through onClose, so withholding it is the
      // whole guard. The title's close button stays live on purpose — fetch has
      // no timeout here, and a hung request with every exit blocked would trap
      // the user in the dialog.
      onClose={isRequesting ? undefined : onCancel}
      open={open}
      // Cleared on enter and on exited. Exited alone isn't enough: the title's
      // close button still closes the dialog mid-request, so a failure can land
      // after the exit has run and would greet the next confirmation; and an
      // exit interrupted by a reopen never fires it at all. On exited rather
      // than on close, so the message isn't removed while still on screen.
      slotProps={{
        transition: { onEnter: onDismissError, onExited: onDismissError },
      }}
    >
      <DialogTitle onClose={onCancel} title="Create New Version" />
      <DialogContent dividers>
        <Typography>
          Are you sure you want to create a new version of{" "}
          {atlas === undefined ? "this atlas" : getAtlasGenerationName(atlas)}?
          This will create a new draft revision that will accept future file
          uploads.
        </Typography>
        <TypographyError>{error}</TypographyError>
      </DialogContent>
      <DialogActions>
        <Button
          color={BUTTON_PROPS.COLOR.SECONDARY}
          disabled={isRequesting || succeeded}
          onClick={onCancel}
          size={BUTTON_PROPS.SIZE.SMALL}
          variant={BUTTON_PROPS.VARIANT.CONTAINED}
        >
          Cancel
        </Button>
        <Button
          color={BUTTON_PROPS.COLOR.PRIMARY}
          disabled={isRequesting || succeeded}
          onClick={() => {
            onSubmit(getRequestURL(API.ATLAS_VERSIONS, pathParameter), {
              onSuccess: (newAtlas) => {
                location.assign(
                  getRouteURL(ROUTE.ATLAS, { atlasId: newAtlas.id }),
                );
              },
            });
          }}
          size={BUTTON_PROPS.SIZE.SMALL}
          variant={BUTTON_PROPS.VARIANT.CONTAINED}
        >
          Create Version
        </Button>
      </DialogActions>
    </Dialog>
  );
};
