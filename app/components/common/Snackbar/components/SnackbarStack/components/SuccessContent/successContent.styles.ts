import { SHADOWS } from "@databiosphere/findable-ui/lib/styles/common/constants/shadows";
import styled from "@emotion/styled";
import { Alert } from "@mui/material";

/*
 * Colours, border, icon and type come from findable-ui's `MuiAlert` success
 * variant; this only fits the alert to the stack, as `errorContent.styles` does
 * for an error.
 */
export const StyledAlert = styled(Alert)`
  box-shadow: ${SHADOWS["02"]};
  max-width: 600px;
  /* The stack container is pointer-events: none; the entries take theirs back. */
  pointer-events: auto;

  /* Clamped to three lines, as an error's message is. */
  .MuiAlert-message {
    -webkit-box-orient: vertical;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    min-width: 0;
    overflow: hidden;
    overflow-wrap: break-word;
  }
`;
