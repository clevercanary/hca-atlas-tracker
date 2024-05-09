import { inkMain } from "@databiosphere/findable-ui/lib/styles/common/mixins/colors";
import { textBody400 } from "@databiosphere/findable-ui/lib/styles/common/mixins/fonts";
import styled from "@emotion/styled";
import { FormLabel as MFormLabel } from "@mui/material";

export const FormLabel = styled(MFormLabel)`
  ${textBody400};
  align-items: center;
  color: ${inkMain};
  display: flex;
  gap: 16px;
  justify-content: space-between;

  &.Mui-error,
  &.Mui-disabled,
  &.Mui-focused {
    color: ${inkMain};
  }

  .MuiLink-root {
    font-weight: 500;
    white-space: nowrap;
  }
`;
