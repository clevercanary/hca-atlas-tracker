import { DeleteIcon } from "@/app/components/common/CustomIcon/components/DeleteIcon/deleteIcon";
import {
  ICON_BUTTON_PROPS,
  SVG_ICON_PROPS,
} from "@/app/components/Detail/components/TrackerForm/components/Section/components/ListSection/constants";
import { ControllerAction } from "@/app/components/Detail/components/TrackerForm/components/Section/components/ListSection/integrationLeadSection.styles";
import { IconButton, type IconButtonProps } from "@mui/material";
import { type JSX } from "react";

interface DeleteItemButtonProps extends Partial<IconButtonProps> {
  inputRowsPerItem: number;
}

export const DeleteItemButton = ({
  inputRowsPerItem,
  ...additionalButtonProps
}: DeleteItemButtonProps): JSX.Element => {
  return (
    <ControllerAction inputRowCount={inputRowsPerItem}>
      <IconButton {...ICON_BUTTON_PROPS} {...additionalButtonProps}>
        <DeleteIcon {...SVG_ICON_PROPS} />
      </IconButton>
    </ControllerAction>
  );
};
