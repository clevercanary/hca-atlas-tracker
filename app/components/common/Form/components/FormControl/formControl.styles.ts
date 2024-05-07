import {
  inkLight,
  inkMain,
  smokeLight,
  successMain,
  warningLightest,
  warningMain,
} from "@databiosphere/findable-ui/lib/styles/common/mixins/colors";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { FormControl as MFormControl } from "@mui/material";

interface Props {
  isFilled: boolean;
  isFullWidth: boolean;
}

export const FormControl = styled(MFormControl, {
  shouldForwardProp: (prop) => prop !== "isFilled" && prop !== "isFullWidth",
})<Props>`
  display: flex;
  flex-direction: column;
  gap: 4px;

  .MuiOutlinedInput-root {
    &.MuiInputBase-adornedStart {
      gap: 0;
    }

    &.MuiInputBase-adornedEnd {
      padding: 0 12px;

      .MuiInputBase-inputAdornedEnd {
        padding: 10px 8px 10px 0;
      }

      .MuiInputAdornment-positionEnd {
        margin: 0 -2px 0 0;
      }
    }

    &.Mui-error {
      &.MuiInputBase-colorWarning {
        background-color: ${warningLightest};

        .MuiOutlinedInput-input {
          -webkit-box-shadow: inset 0 40px ${warningLightest};
        }

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
        -webkit-box-shadow: none;
      }

      .MuiSelect-select {
        cursor: default;
      }
    }

    ${({ isFilled, ...props }) =>
      isFilled &&
      css`
        & .MuiOutlinedInput-input,
        .MuiSvgIcon-root {
          color: ${inkMain(props)};

          &.MuiSvgIcon-colorError {
            color: ${warningMain(props)};
          }

          &.MuiSvgIcon-colorSuccess {
            color: ${successMain(props)};
          }
        }
      `};
  }

  ${({ isFullWidth }) =>
    isFullWidth &&
    css`
      grid-column: 1 / -1;
    `};
`;
