import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import styled from "@emotion/styled";
import Link from "next/link";

export const StyledFileList = styled.ul`
  border-top: 1px solid ${PALETTE.SMOKE_MAIN};
  list-style: none;
  margin: 0;
  padding: 0;

  li:not(:last-of-type) {
    border-bottom: 1px solid ${PALETTE.SMOKE_MAIN};
  }
`;

export const StyledFileLink = styled(Link)`
  align-items: center;
  color: ${PALETTE.INK_LIGHT};
  display: grid;
  gap: 8px;
  grid-template-columns: 1fr auto auto;
  min-height: 44px;
  padding: 8px 16px;
  text-decoration: none;

  &:hover {
    background-color: ${PALETTE.SMOKE_LIGHTEST};
  }
`;
