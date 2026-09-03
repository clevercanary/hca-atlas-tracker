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
import { useSnackbarContainerRef } from "@/app/components/common/Snackbar/hooks/UseSnackbarContainerRef/hook";
import { SNACKBAR_SCOPE } from "@/app/components/common/Snackbar/types";
import { usePublishAtlas } from "@/app/hooks/UsePublishAtlas/hook";
import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/button";
import { Button } from "@mui/material";
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
  const { isRequesting, onSubmit } = usePublishAtlas();
  const snackbarContainerRef = useSnackbarContainerRef(
    open,
    SNACKBAR_SCOPE.PUBLISH_ATLAS,
  );
  return (
    // The toast renders inside this dialog while it is open, so a failure here
    // is reachable by Tab; see `useSnackbarContainerRef`.
    <Dialog
      fullWidth
      maxWidth="xs"
      onClose={onCancel}
      open={open}
      PaperProps={{ ref: snackbarContainerRef }}
    >
      <DialogTitle onClose={onCancel} title="Publish Atlas" />
      <DialogContent dividers>
        Are you sure you want to publish{" "}
        {atlas === undefined ? "this atlas" : getAtlasName(atlas)}? This action
        is irreversible and will freeze the source dataset and integrated object
        lists for this version.
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
