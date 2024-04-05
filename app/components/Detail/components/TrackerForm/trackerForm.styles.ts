import styled from "@emotion/styled";

export const Form = styled.form`
  display: grid;
  gap: inherit;
  grid-column: 1 / -1;
  grid-template-columns: inherit;
`;

export const FormActions = styled.div`
  display: flex;
  gap: 8px;
  grid-column: 1 / -1;
  justify-content: flex-end;
`;
