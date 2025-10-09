import { DownloadIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/DownloadIcon/downloadIcon";
import { useDialog } from "@databiosphere/findable-ui/lib/components/common/Dialog/hooks/useDialog";
import { IconButton } from "@mui/material";
import { Fragment } from "react";
import { FetchDataStateProvider } from "../../../../../../../../../providers/fetchDataState/fetchDataState";
import { Dialog } from "./components/Dialog/dialog";
import { ICON_BUTTON_PROPS, SVG_ICON_PROPS } from "./constants";
import { Props } from "./entities";

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
      <FetchDataStateProvider initialState={{ shouldFetch: false }}>
        <Dialog
          fileId={fileId}
          fileName={fileName}
          onClose={onClose}
          open={open}
          sizeBytes={sizeBytes}
        />
      </FetchDataStateProvider>
    </Fragment>
  );
};
