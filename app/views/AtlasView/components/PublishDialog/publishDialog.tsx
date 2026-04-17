import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/button";
import { Button } from "@mui/material";
import { JSX } from "react";
import { API } from "../../../../apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerAtlas } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { getAtlasName } from "../../../../apis/catalog/hca-atlas-tracker/common/utils";
import { PathParameter } from "../../../../common/entities";
import { getRequestURL } from "../../../../common/utils";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "../../../../components/common/ConfirmationDialog/confirmationDialog.styles";
import { usePublishAtlas } from "../../../../hooks/UsePublishAtlas/hook";

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
  return (
    <Dialog fullWidth maxWidth="xs" onClose={onCancel} open={open}>
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
