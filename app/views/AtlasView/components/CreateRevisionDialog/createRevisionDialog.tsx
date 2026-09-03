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
import { useSnackbarContainerRef } from "@/app/components/common/Snackbar/hooks/UseSnackbarContainerRef/hook";
import { SNACKBAR_SCOPE } from "@/app/components/common/Snackbar/types";
import { useCreateAtlasRevision } from "@/app/hooks/UseCreateAtlasRevision/hook";
import { ROUTE } from "@/app/routes/constants";
import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/button";
import { Button } from "@mui/material";
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
  const { isRequesting, onSubmit, succeeded } = useCreateAtlasRevision();
  const snackbarContainerRef = useSnackbarContainerRef(
    open,
    SNACKBAR_SCOPE.CREATE_ATLAS_REVISION,
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
      <DialogTitle onClose={onCancel} title="Create New Version" />
      <DialogContent dividers>
        Are you sure you want to create a new version of{" "}
        {atlas === undefined ? "this atlas" : getAtlasGenerationName(atlas)}?
        This will create a new draft revision that will accept future file
        uploads.
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
