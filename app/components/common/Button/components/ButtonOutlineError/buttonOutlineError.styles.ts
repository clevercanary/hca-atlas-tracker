import { alertMain } from "@clevercanary/data-explorer-ui/lib/styles/common/mixins/colors";
import {
  alpha08,
  alpha32,
  alpha64,
} from "@clevercanary/data-explorer-ui/lib/theme/common/palette";
import styled from "@emotion/styled";
import { Button as MButton } from "@mui/material";
import { button } from "../../button.styles";

export const ButtonOutlineError = styled(MButton)`
  ${button};
  border: none;
  box-shadow: inset 0 0 0 1px ${alertMain};
  color: ${alertMain};

  &:hover {
    background-color: ${alertMain}${alpha08};
    border: none;
    box-shadow: inset 0 0 0 1px ${alertMain}${alpha64};
    color: ${alertMain};
  }

  &:disabled {
    border: none;
    box-shadow: inset 0 0 0 1px ${alertMain}${alpha32};
    color: ${alertMain};
    opacity: 0.5;
  }
`;
