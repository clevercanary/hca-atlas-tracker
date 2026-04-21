import styled from "@emotion/styled";

export const SubGrid = styled.div`
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: subgrid;
  height: 100%;
  min-height: 0;
  row-gap: 16px;
`;
