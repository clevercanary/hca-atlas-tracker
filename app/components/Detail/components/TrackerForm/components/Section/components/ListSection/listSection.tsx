import { AddIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/AddIcon/addIcon";
import { ButtonProps } from "@mui/material";
import { ReactNode } from "react";
import { SectionCard } from "../../section.styles";
import { BUTTON_PROPS } from "./constants";
import { StyledButton } from "./integrationLeadSection.styles";

interface ListSectionProps {
  addItemButtonProps: ButtonProps;
  children: ReactNode;
  fullWidth?: boolean;
}

export const ListSection = ({
  addItemButtonProps,
  children,
  fullWidth,
}: ListSectionProps): JSX.Element => {
  return (
    <SectionCard fullWidth={fullWidth} gridAutoFlow="dense">
      {children}
      <StyledButton
        {...BUTTON_PROPS}
        startIcon={<AddIcon />}
        {...addItemButtonProps}
      />
    </SectionCard>
  );
};
