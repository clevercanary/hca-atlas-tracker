import { DownloadIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/DownloadIcon/downloadIcon";
import { useDialog } from "@databiosphere/findable-ui/lib/components/common/Dialog/hooks/useDialog";
import { IconButton } from "@mui/material";
import { Fragment, type JSX } from "react";
import { Dialog } from "./components/Dialog/dialog";
import { ICON_BUTTON_PROPS, SVG_ICON_PROPS } from "./constants";
import { type Props } from "./entities";

export const FileDownloadCell = ({
  disabled,
  fileId,
  fileName,
  sizeBytes,
  ...props
}: Props): JSX.Element => {
  const { onClose, onOpen, open } = useDialog();
  return (
    <Fragment>
      <IconButton
        {...ICON_BUTTON_PROPS}
        disabled={disabled || !fileId}
        onClick={onOpen}
        {...props}
      >
        <DownloadIcon {...SVG_ICON_PROPS} />
      </IconButton>
      <Dialog
        fileId={fileId}
        fileName={fileName}
        onClose={onClose}
        open={open}
        sizeBytes={sizeBytes}
      />
    </Fragment>
  );
};
