import styled from "@emotion/styled";

export const Actions = styled.div`
  align-items: center;
  display: grid;
  flex: 1;
  gap: 8px;
  grid-template-areas: "delete . discard save";
  grid-template-columns: auto 1fr auto auto;

  .MuiButton-errorContained {
    grid-area: delete;
  }

  .MuiButton-containedSecondary {
    grid-area: discard;
  }

  .MuiButton-containedPrimary {
    grid-area: save;
  }
`;
