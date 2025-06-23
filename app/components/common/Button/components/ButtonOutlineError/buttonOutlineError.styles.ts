import { COLOR_MIXES } from "@databiosphere/findable-ui/lib/styles/common/constants/colorMixes";
import { alertMain } from "@databiosphere/findable-ui/lib/styles/common/mixins/colors";
import styled from "@emotion/styled";
import { Button as MButton } from "@mui/material";
import { button } from "../../button.styles";

export const ButtonOutlineError = styled(MButton)`
  ${button};
  border: none;
  box-shadow: inset 0 0 0 1px ${alertMain};
  color: ${alertMain};

  &:hover {
    background-color: ${COLOR_MIXES.ALERT_MAIN_08};
    border: none;
    box-shadow: inset 0 0 0 1px ${COLOR_MIXES.ALERT_MAIN_64};
    color: ${alertMain};
  }

  &:disabled {
    border: none;
    box-shadow: inset 0 0 0 1px ${COLOR_MIXES.ALERT_MAIN_32};
    color: ${alertMain};
    opacity: 0.5;
  }
`;
