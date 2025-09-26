import { DownloadIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/DownloadIcon/downloadIcon";
import { useDialog } from "@databiosphere/findable-ui/lib/components/common/Dialog/hooks/useDialog";
import { IconButton } from "@mui/material";
import { Fragment } from "react";
import { FetchDataStateProvider } from "../../../../../../../../../providers/fetchDataState/fetchDataState";
import { Dialog } from "./components/Dialog/dialog";
import { ICON_BUTTON_PROPS } from "./constants";
import { Props } from "./entities";

export const FileDownloadCell = ({ ...props }: Props): JSX.Element => {
  const { onClose, onOpen, open } = useDialog();
  return (
    <Fragment>
      <IconButton {...ICON_BUTTON_PROPS} onClick={onOpen} {...props}>
        <DownloadIcon />
      </IconButton>
      <FetchDataStateProvider>
        <Dialog onClose={onClose} open={open} />
      </FetchDataStateProvider>
    </Fragment>
  );
};
