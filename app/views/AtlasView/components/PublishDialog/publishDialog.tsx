import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/button";
import { Button } from "@mui/material";
import { JSX, useState } from "react";
import { HCAAtlasTrackerAtlas } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { getAtlasName } from "../../../../apis/catalog/hca-atlas-tracker/common/utils";
import { PathParameter } from "../../../../common/entities";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "../../../../components/common/ConfirmationDialog/confirmationDialog.styles";
import { usePublishAtlas } from "app/hooks/UsePublishAtlas/hook";
import { getRequestURL } from "app/common/utils";
import { API } from "app/apis/catalog/hca-atlas-tracker/common/api";

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
  const { onSubmit } = usePublishAtlas();
  const [submitted, setSubmitted] = useState(false);
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
          disabled={submitted}
          onClick={onCancel}
          size={BUTTON_PROPS.SIZE.SMALL}
          variant={BUTTON_PROPS.VARIANT.CONTAINED}
        >
          Cancel
        </Button>
        <Button
          color={BUTTON_PROPS.COLOR.PRIMARY}
          disabled={submitted}
          onClick={() => {
            setSubmitted(true);
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
