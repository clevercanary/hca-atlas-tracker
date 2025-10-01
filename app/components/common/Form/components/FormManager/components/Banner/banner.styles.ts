import { AppBar as DXAppBar } from "@databiosphere/findable-ui/lib/components/Layout/components/Header/header.styles";
import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import styled from "@emotion/styled";

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
