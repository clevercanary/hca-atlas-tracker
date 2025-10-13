import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import styled from "@emotion/styled";
import { FormControl } from "../FormControl/formControl.styles";

export const InputFormControl = styled(FormControl)`
  .MuiOutlinedInput-root {
    .MuiOutlinedInput-input {
      -webkit-box-shadow: inset 0 40px ${PALETTE.COMMON_WHITE}; /* autoComplete - email field */
      padding: 10px 12px 10px 0;
    }

    &.MuiInputBase-multiline {
      padding: 0 0 0 12px;
    }

    input {
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    input::placeholder,
    textarea::placeholder {
      color: ${PALETTE.INK_LIGHT};
      opacity: 0.8;
    }

    &.Mui-focused {
      input::placeholder,
      textarea::placeholder {
        opacity: 0;
      }
    }
  }
`;
