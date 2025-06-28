import { BaseComponentProps } from "@databiosphere/findable-ui/lib/components/types";
import { PaperProps } from "@mui/material";
import { StyledPaper } from "./fluidPaper.styles";

export const FluidPaper = (
  props: BaseComponentProps & PaperProps
): JSX.Element => {
  return <StyledPaper {...props} />;
};
