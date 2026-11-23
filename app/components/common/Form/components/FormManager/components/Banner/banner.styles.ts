import { AppBar as DXAppBar } from "@databiosphere/findable-ui/lib/components/Layout/components/Header/header.styles";
import { COLOR_MIXES } from "@databiosphere/findable-ui/lib/styles/common/constants/colorMixes";
import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import styled from "@emotion/styled";
import { Button } from "@mui/material";

export const AppBar = styled(DXAppBar)`
  background-color: ${PALETTE.INK_MAIN};
  color: ${PALETTE.COMMON_WHITE};

  &.MuiPaper-elevation0 {
    border-bottom: none;
  }

  .MuiToolbar-root {
    display: flex;
    justify-content: space-between;
    margin: 0 auto;
    max-width: min(calc(100% - 32px), 1232px);
    padding: 0;
    width: 100%;
  }
` as typeof DXAppBar;

export const ButtonOutline = styled(Button)`
  background-color: transparent;
  border: none;
  box-shadow: inset 0 0 0 1px ${COLOR_MIXES.COMMON_WHITE_32};
  color: ${PALETTE.COMMON_WHITE};

  &:hover,
  &:active {
    background-color: transparent;
    box-shadow: inset 0 0 0 1px ${COLOR_MIXES.COMMON_WHITE_64};
  }

  &.Mui-focusVisible,
  &:disabled {
    background-color: transparent;
    box-shadow: inset 0 0 0 1px ${COLOR_MIXES.COMMON_WHITE_32};
    color: ${PALETTE.COMMON_WHITE};
  }
`;
