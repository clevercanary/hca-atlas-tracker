import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import styled from "@emotion/styled";
import { Stack } from "@mui/material";
import { StyledStackProps } from "./types";

// A highlighted row paints an alert background with breathing room on all sides.
// The padding is cancelled by an equal negative margin (and a widened box so the
// value stays right-aligned) so the row's layout box (28px tall, full width) —
// and therefore the section and card — does not grow; the background simply
// bleeds into the surrounding gap and section padding.
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
      margin: -6px -8px;
      padding: 6px 8px;
      width: calc(100% + 16px);
    `}
`;
