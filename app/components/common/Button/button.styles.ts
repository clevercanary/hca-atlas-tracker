import { COLOR_MIXES } from "@databiosphere/findable-ui/lib/styles/common/constants/colorMixes";
import {
  inkMain,
  primaryDark,
  primaryMain,
  smokeDark,
  smokeLightest,
  white,
} from "@databiosphere/findable-ui/lib/styles/common/mixins/colors";
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
  background-color: ${primaryMain(props)};
  box-shadow: 0 1px 0 0 ${primaryDark(props)};
  color: ${white(props)};

  &:hover {
    background-color: ${primaryDark(props)};
    box-shadow: 0 1px 0 0 ${primaryDark(props)};
  }

  &:active {
    background-color: ${primaryDark(props)};
    box-shadow: none;
  }
`;

export const buttonSecondary = (props: ThemeProps) => css`
  ${button(props)};
  background-color: ${white(props)};
  box-shadow: inset 0 0 0 1px ${smokeDark(props)},
    0 1px 0 0 ${COLOR_MIXES.COMMON_BLACK_08};
  color: ${inkMain(props)};

  &:hover {
    background-color: ${smokeLightest(props)};
    box-shadow: inset 0 0 0 1px ${smokeDark(props)},
      0 1px 0 0 ${COLOR_MIXES.COMMON_BLACK_08};
  }

  &:active {
    background-color: ${smokeLightest(props)};
    box-shadow: inset 0 0 0 1px ${smokeDark(props)};
  }
`;
