import { FONT } from "@databiosphere/findable-ui/lib/styles/common/constants/font";
import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import styled from "@emotion/styled";

export const Figure = styled.figure`
  margin: 32px 0;
  position: relative;

  img {
    border: 1px solid ${PALETTE.SMOKE_MAIN};
    border-radius: 6px;
    height: auto !important;
    inset: auto !important;
    margin: 0 auto;
    position: relative !important;
  }

  figcaption {
    font: ${FONT.BODY_400};
    margin-top: 8px;
    text-align: center;
  }
`;
