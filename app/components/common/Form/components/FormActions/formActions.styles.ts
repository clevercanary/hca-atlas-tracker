import styled from "@emotion/styled";
import { FORM_ACTION_CLASS_NAME } from "./constants";

export const Actions = styled.div`
  align-items: center;
  display: grid;
  flex: 1;
  gap: 8px;
  grid-template-areas: "delete . discard save";
  grid-template-columns: auto 1fr auto auto;

  .${FORM_ACTION_CLASS_NAME.DELETE} {
    grid-area: delete;
  }

  .${FORM_ACTION_CLASS_NAME.DISCARD} {
    grid-area: discard;
  }

  .${FORM_ACTION_CLASS_NAME.SAVE} {
    grid-area: save;
  }
`;
