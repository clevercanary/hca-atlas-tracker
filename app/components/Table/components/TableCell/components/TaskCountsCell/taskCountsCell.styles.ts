import styled from "@emotion/styled";

export const Cell = styled.div`
  align-items: center;
  display: grid;
  gap: 4px;
  grid-auto-flow: column;
  justify-content: flex-start;

  .MuiCircularProgress-root {
    margin: 2px;
  }
`;
