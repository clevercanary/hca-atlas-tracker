import { COLOR_MIXES } from "@databiosphere/findable-ui/lib/styles/common/constants/colorMixes";
import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import { textBody500 } from "@databiosphere/findable-ui/lib/styles/common/mixins/fonts";
import { ThemeProps } from "@databiosphere/findable-ui/lib/theme/theme";
import { css } from "@emotion/react";

export const button = (props: ThemeProps) => css`
  ${textBody500(props)};
  align-items: center;
  border-radius: 4px;
  display: flex;
  gap: 4px;
  justify-content: center;
  letter-spacing: normal;
  padding: 8px 16px;
`;

export const buttonPrimary = (props: ThemeProps) => css`
  ${button(props)};
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

export const buttonSecondary = (props: ThemeProps) => css`
  ${button(props)};
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
