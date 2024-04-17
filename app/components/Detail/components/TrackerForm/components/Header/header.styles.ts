import { AppBar as DXAppBar } from "@clevercanary/data-explorer-ui/lib/components/Layout/components/Header/header.styles";
import {
  inkMain,
  white,
} from "@clevercanary/data-explorer-ui/lib/styles/common/mixins/colors";
import { textBodyLarge500 } from "@clevercanary/data-explorer-ui/lib/styles/common/mixins/fonts";
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

export const FormStatus = styled.div`
  ${textBodyLarge500};
  opacity: 0.7;
`;

export const FormActions = styled.div`
  display: flex;
  flex: 1;
  gap: 8px;
  justify-content: flex-end;
`;
