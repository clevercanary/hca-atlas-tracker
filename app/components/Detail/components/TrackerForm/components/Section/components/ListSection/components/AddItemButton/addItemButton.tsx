import { AddIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/AddIcon/addIcon";
import { ButtonProps } from "@mui/material";
import { BUTTON_PROPS } from "../../constants";
import { StyledButton } from "../../integrationLeadSection.styles";

export const AddItemButton = (props: ButtonProps): JSX.Element => {
  return <StyledButton {...BUTTON_PROPS} startIcon={<AddIcon />} {...props} />;
};
