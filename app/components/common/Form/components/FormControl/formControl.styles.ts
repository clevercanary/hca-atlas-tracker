import {
  inkLight,
  inkMain,
  smokeLight,
  warningLightest,
  warningMain,
} from "@clevercanary/data-explorer-ui/lib/styles/common/mixins/colors";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { FormControl as MFormControl } from "@mui/material";

interface Props {
  isFilled: boolean;
}

export const FormControl = styled(MFormControl, {
  shouldForwardProp: (prop) => prop !== "isFilled",
})<Props>`
  display: flex;
  flex-direction: column;
  gap: 4px;

  .MuiOutlinedInput-root {
    &.Mui-error {
      &.MuiInputBase-colorWarning {
        background-color: ${warningLightest};

        .MuiOutlinedInput-notchedOutline {
          border-color: ${warningMain};
        }
      }
    }

    &.Mui-disabled,
    &.Mui-readOnly {
      background-color: ${smokeLight};
      color: ${inkLight};

      .MuiOutlinedInput-input {
        -webkit-text-fill-color: ${inkLight};
      }
    }

    ${({ isFilled, ...props }) =>
      isFilled &&
      css`
        & .MuiOutlinedInput-input,
        .MuiSvgIcon-root {
          color: ${inkMain(props)};
        }
      `};
  }
`;
