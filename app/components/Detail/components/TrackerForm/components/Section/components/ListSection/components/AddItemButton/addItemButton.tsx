import { BUTTON_PROPS } from "@/app/components/Detail/components/TrackerForm/components/Section/components/ListSection/constants";
import { StyledButton } from "@/app/components/Detail/components/TrackerForm/components/Section/components/ListSection/integrationLeadSection.styles";
import { AddIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/AddIcon/addIcon";
import { type ButtonProps } from "@mui/material";
import { type JSX } from "react";

export const AddItemButton = (props: ButtonProps): JSX.Element => {
  return <StyledButton {...BUTTON_PROPS} startIcon={<AddIcon />} {...props} />;
};
