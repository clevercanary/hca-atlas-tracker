import { COLOR_MIXES } from "@databiosphere/findable-ui/lib/styles/common/constants/colorMixes";
import { FONT } from "@databiosphere/findable-ui/lib/styles/common/constants/font";
import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import { css } from "@emotion/react";

export const button = css`
  align-items: center;
  border-radius: 4px;
  display: flex;
  gap: 4px;
  font: ${FONT.BODY_500};
  justify-content: center;
  letter-spacing: normal;
  padding: 8px 16px;
`;

export const buttonPrimary = css`
  ${button};
  background-color: ${PALETTE.PRIMARY_MAIN};
  box-shadow: 0 1px 0 0 ${COLOR_MIXES.COMMON_BLACK_08},
    inset 0 -1px 0 0 ${COLOR_MIXES.COMMON_BLACK_20};
  color: ${PALETTE.COMMON_WHITE};

  &:hover,
  &:active {
    background-color: ${PALETTE.PRIMARY_DARK};
    box-shadow: 0 1px 0 0 ${COLOR_MIXES.COMMON_BLACK_08},
      inset 0 -1px 0 0 ${COLOR_MIXES.COMMON_BLACK_20};
  }

  &.Mui-disabled {
    background-color: ${PALETTE.PRIMARY_MAIN};
    box-shadow: none;
    color: ${PALETTE.COMMON_WHITE};
    opacity: 0.5;
  }
`;

export const buttonSecondary = css`
  ${button};
  background-color: ${PALETTE.COMMON_WHITE};
  box-shadow: inset 0 0 0 1px ${PALETTE.SMOKE_DARK},
    0 1px 0 0 ${COLOR_MIXES.COMMON_BLACK_05};
  color: ${PALETTE.INK_MAIN};

  &:hover,
  &:active {
    background-color: ${PALETTE.SMOKE_LIGHTEST};
    box-shadow: inset 0 0 0 1px ${PALETTE.SMOKE_DARK},
      0 1px 0 0 ${COLOR_MIXES.COMMON_BLACK_05};
  }

  &.Mui-disabled {
    background-color: ${PALETTE.COMMON_WHITE};
    box-shadow: inset 0 0 0 1px ${PALETTE.SMOKE_DARK};
    color: ${PALETTE.INK_MAIN};
    opacity: 0.5;
  }
`;
