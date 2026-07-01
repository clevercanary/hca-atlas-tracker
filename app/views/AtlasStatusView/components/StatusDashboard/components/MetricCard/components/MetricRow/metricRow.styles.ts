import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import styled from "@emotion/styled";
import { Stack } from "@mui/material";
import { StyledStackProps } from "./types";

// A highlighted row paints an alert background with vertical breathing room. The
// padding is cancelled by an equal negative margin so the row's layout box (28px)
// — and therefore the section and card — does not grow; the background simply
// bleeds into the surrounding gap.
export const StyledStack = styled(Stack, {
  shouldForwardProp: (prop) => prop !== "highlighted",
})<StyledStackProps>`
  align-items: center;
  flex-direction: row;
  gap: 8px;
  justify-content: space-between;
  width: 100%;

  ${({ highlighted }) =>
    highlighted &&
    `
      background-color: ${PALETTE.ALERT_LIGHTEST};
      margin: -6px 0;
      padding: 6px 0;
    `}
`;
