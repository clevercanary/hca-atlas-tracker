import { css } from "@emotion/react";
import styled from "@emotion/styled";

// Prototype: Inter Tight Medium for headings instead of the tracker's DIN
// 2014, for the report and the atlas title while the report is shown.
export const HEADING_FONT_URL =
  "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500&display=swap";

export const HEADING_FONT = css`
  font-family: "Inter Tight", Inter, sans-serif;
  font-weight: 500;
  /* Inter Tight is already tightly spaced; drop the theme's negative tracking. */
  letter-spacing: normal;
`;

export const HEADING_STYLES = css`
  h1.MuiTypography-heading-large {
    ${HEADING_FONT};
  }
`;

export const StyledReport = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  grid-column: 1 / -1;
  min-width: 0;

  [class*="MuiTypography-heading"] {
    ${HEADING_FONT};
  }
`;
