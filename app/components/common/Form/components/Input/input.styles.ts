import { inkLight } from "@clevercanary/data-explorer-ui/lib/styles/common/mixins/colors";
import styled from "@emotion/styled";
import { FormControl } from "../FormControl/formControl.styles";

export const InputFormControl = styled(FormControl)`
  .MuiOutlinedInput-root {
    .MuiOutlinedInput-input {
      padding: 10px 10px 10px 0;
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
      color: ${inkLight};
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
