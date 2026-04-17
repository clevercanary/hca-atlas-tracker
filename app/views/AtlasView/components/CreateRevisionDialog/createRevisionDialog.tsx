import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/button";
import { Button } from "@mui/material";
import { JSX } from "react";
import { API } from "../../../../apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerAtlas } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { getAtlasGenerationName } from "../../../../apis/catalog/hca-atlas-tracker/common/utils";
import { PathParameter } from "../../../../common/entities";
import { getRequestURL, getRouteURL } from "../../../../common/utils";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "../../../../components/common/ConfirmationDialog/confirmationDialog.styles";
import { useCreateAtlasRevision } from "../../../../hooks/UseCreateAtlasRevision/hook";
import { ROUTE } from "../../../../routes/constants";

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
  return (
    <Dialog fullWidth maxWidth="xs" onClose={onCancel} open={open}>
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
