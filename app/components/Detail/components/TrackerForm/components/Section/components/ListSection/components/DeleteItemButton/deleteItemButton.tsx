import { IconButton, IconButtonProps } from "@mui/material";
import { DeleteIcon } from "../../../../../../../../../common/CustomIcon/components/DeleteIcon/deleteIcon";
import { ICON_BUTTON_PROPS, SVG_ICON_PROPS } from "../../constants";
import { ControllerAction } from "../../integrationLeadSection.styles";

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
