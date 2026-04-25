import { FONT } from "@databiosphere/findable-ui/lib/styles/common/constants/font";
import styled from "@emotion/styled";
import { FormControlLabel } from "@mui/material";

export const StyledFormControlLabel = styled(FormControlLabel)`
  .MuiFormControlLabel-label {
    font: ${FONT.BODY_500};
  }
`;
