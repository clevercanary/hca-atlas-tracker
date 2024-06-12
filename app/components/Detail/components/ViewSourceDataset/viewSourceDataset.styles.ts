import { ButtonTextPrimary as DXButtonTextPrimary } from "@databiosphere/findable-ui/lib/components/common/Button/components/ButtonTextPrimary/buttonTextPrimary";
import { inkMain } from "@databiosphere/findable-ui/lib/styles/common/mixins/colors";
import styled from "@emotion/styled";
import { Dialog as CommonDialog } from "../../../common/Dialog/dialog.styles";

export const ButtonTextPrimary = styled(DXButtonTextPrimary)`
  &.MuiButton-text {
    display: block;
    flex: 1;
    text-align: left;

    &.Mui-disabled {
      color: ${inkMain};
      font-weight: 400;
    }
  }
`;

export const Dialog = styled(CommonDialog)`
  .MuiPaper-root {
    max-width: 712px;
    width: 100%;
  }
`;
