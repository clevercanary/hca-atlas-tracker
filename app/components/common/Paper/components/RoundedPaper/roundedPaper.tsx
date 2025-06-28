import { BaseComponentProps } from "@databiosphere/findable-ui/lib/components/types";
import { PaperProps } from "@mui/material";
import { StyledPaper } from "./roundedPaper.styles";

export const RoundedPaper = (
  props: BaseComponentProps & PaperProps
): JSX.Element => {
  return <StyledPaper {...props} />;
};
