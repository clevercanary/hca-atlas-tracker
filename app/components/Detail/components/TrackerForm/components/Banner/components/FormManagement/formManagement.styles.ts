import { textBodyLarge500 } from "@clevercanary/data-explorer-ui/lib/styles/common/mixins/fonts";
import styled from "@emotion/styled";

export const FormStatus = styled.div`
  ${textBodyLarge500};
  opacity: 0.7;
`;

export const FormActions = styled.div`
  display: flex;
  flex: 1;
  gap: 8px;
  justify-content: flex-end;
`;
