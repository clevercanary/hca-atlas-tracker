import { AppBar as DXAppBar } from "@clevercanary/data-explorer-ui/lib/components/Layout/components/Header/header.styles";
import {
  inkMain,
  white,
} from "@clevercanary/data-explorer-ui/lib/styles/common/mixins/colors";
import styled from "@emotion/styled";

export const AppBar = styled(DXAppBar)`
  background-color: ${inkMain};
  color: ${white};

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
