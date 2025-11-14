import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import { bpUpMd } from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { FormControl as MFormControl } from "@mui/material";

interface Props {
  isFilled: boolean;
  isFullWidth: boolean;
  isRowStart?: boolean;
}

export const FormControl = styled(MFormControl, {
  shouldForwardProp: (prop) =>
    prop !== "isFilled" && prop !== "isFullWidth" && prop !== "isRowStart",
})<Props>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  grid-column: unset;

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
        background-color: ${PALETTE.WARNING_LIGHTEST};

        .MuiOutlinedInput-input {
          -webkit-box-shadow: inset 0 40px ${PALETTE.WARNING_LIGHTEST};
        }

        .MuiOutlinedInput-notchedOutline {
          border-color: ${PALETTE.WARNING_MAIN};
        }
      }
    }

    &.Mui-disabled,
    &.Mui-readOnly {
      background-color: ${PALETTE.SMOKE_LIGHT};
      color: ${PALETTE.INK_LIGHT};

      .MuiOutlinedInput-input {
        -webkit-text-fill-color: ${PALETTE.INK_LIGHT};
        -webkit-box-shadow: none;
      }

      .MuiSelect-select {
        cursor: default;
      }
    }

    ${({ isFilled }) =>
      isFilled &&
      css`
        & .MuiOutlinedInput-input,
        .MuiSvgIcon-root {
          color: ${PALETTE.INK_MAIN};

          &.MuiSvgIcon-colorError {
            color: ${PALETTE.WARNING_MAIN};
          }

          &.MuiSvgIcon-colorSuccess {
            color: ${PALETTE.SUCCESS_MAIN};
          }
        }
      `};
  }

  ${({ isRowStart }) =>
    isRowStart &&
    css`
      grid-column: 1;
    `};

  ${({ isFullWidth, theme }) =>
    isFullWidth &&
    css`
      ${bpUpMd({ theme })} {
        grid-column: 1 / -1;
      }
    `};
`;
