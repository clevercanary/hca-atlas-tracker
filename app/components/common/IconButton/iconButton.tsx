import { IconButtonProps as DXIconButtonProps } from "@databiosphere/findable-ui/lib/components/common/IconButton/iconButton";
import { StyledIconButton } from "./iconButton.styles";

export const IconButton = ({ ...props }: DXIconButtonProps): JSX.Element => {
  return <StyledIconButton {...props} />;
};
