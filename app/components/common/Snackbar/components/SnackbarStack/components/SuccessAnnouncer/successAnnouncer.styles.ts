import styled from "@emotion/styled";

/*
 * Visually hidden but kept in the accessibility tree — not `display: none` or
 * `visibility: hidden`, either of which would take the region out of it and
 * defeat the point (see `SuccessAnnouncer`). The visible confirmation is the
 * toast in the stack.
 */
export const StyledRegion = styled.div`
  border: 0;
  clip-path: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`;
