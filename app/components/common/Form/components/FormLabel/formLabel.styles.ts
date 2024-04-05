import { inkMain } from "@clevercanary/data-explorer-ui/lib/styles/common/mixins/colors";
import { textBody400 } from "@clevercanary/data-explorer-ui/lib/styles/common/mixins/fonts";
import styled from "@emotion/styled";
import { FormLabel as MFormLabel } from "@mui/material";

export const FormLabel = styled(MFormLabel)`
  ${textBody400};
  color: ${inkMain};

  &.Mui-error,
  &.Mui-disabled,
  &.Mui-focused {
    color: ${inkMain};
  }
`;
