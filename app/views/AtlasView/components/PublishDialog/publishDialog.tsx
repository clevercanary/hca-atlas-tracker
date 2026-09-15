import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { type HCAAtlasTrackerAtlas } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { getAtlasName } from "@/app/apis/catalog/hca-atlas-tracker/common/utils";
import { type PathParameter } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@/app/components/common/ConfirmationDialog/confirmationDialog.styles";
import { TypographyError } from "@/app/components/common/Typography/components/TypographyError/typographyError";
import { usePublishAtlas } from "@/app/hooks/UsePublishAtlas/hook";
import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/button";
import { Button, Typography } from "@mui/material";
import { type JSX } from "react";

interface Props {
  atlas: HCAAtlasTrackerAtlas | undefined;
  onCancel: () => void;
  onPublished: () => void;
  open: boolean;
  pathParameter: PathParameter;
}

export const PublishDialog = ({
  atlas,
  onCancel,
  onPublished,
  open,
  pathParameter,
}: Props): JSX.Element => {
  const {
    actions: { onDismissError, onSubmit },
    status: { error, isRequesting },
  } = usePublishAtlas();

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      // Undefined while the request is in flight, which blocks both escape and
      // the backdrop: MUI routes each through onClose, so withholding it is the
      // whole guard. What it stops is the accidental early close — a stray
      // backdrop click, a reflexive escape — which is also the path where a
      // failure can land against a dialog that has already moved on. onEnter
      // and onExited below cover that timing; this keeps them from being the
      // only thing between a late failure and the next confirmation. It also
      // keeps the exits consistent with the buttons, already disabled
      // mid-request.
      //
      // The title's close button stays live: closing with the "x" is a
      // deliberate act rather than a reflex, and fetch has no timeout here, so
      // it is the out if a request hangs.
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
      <DialogTitle onClose={onCancel} title="Publish Atlas" />
      <DialogContent dividers>
        <Typography>
          Are you sure you want to publish{" "}
          {atlas === undefined ? "this atlas" : getAtlasName(atlas)}? This
          action is irreversible and will freeze the source dataset and
          integrated object lists for this version.
        </Typography>
        <TypographyError>{error}</TypographyError>
      </DialogContent>
      <DialogActions>
        <Button
          color={BUTTON_PROPS.COLOR.SECONDARY}
          disabled={isRequesting}
          onClick={onCancel}
          size={BUTTON_PROPS.SIZE.SMALL}
          variant={BUTTON_PROPS.VARIANT.CONTAINED}
        >
          Cancel
        </Button>
        <Button
          color={BUTTON_PROPS.COLOR.PRIMARY}
          disabled={isRequesting}
          onClick={() => {
            onSubmit(getRequestURL(API.ATLAS_PUBLISH, pathParameter), {
              onSuccess: onPublished,
            });
          }}
          size={BUTTON_PROPS.SIZE.SMALL}
          variant={BUTTON_PROPS.VARIANT.CONTAINED}
        >
          Publish
        </Button>
      </DialogActions>
    </Dialog>
  );
};
