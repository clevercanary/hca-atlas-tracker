import { FluidPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/components/FluidPaper/fluidPaper";
import { sectionPadding } from "@databiosphere/findable-ui/lib/components/common/Section/section.styles";
import { FONT } from "@databiosphere/findable-ui/lib/styles/common/constants/font";
import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import styled from "@emotion/styled";
import Link from "next/link";

export const StyledHeader = styled(FluidPaper)`
  display: flex;
  flex-direction: column;
  gap: 8px;
  ${sectionPadding};
`;

export const StyledBackLink = styled(Link)`
  align-items: center;
  align-self: flex-start;
  color: ${PALETTE.PRIMARY_MAIN};
  display: flex;
  font: ${FONT.BODY_500};
  gap: 4px;
  margin-left: -4px;
  min-height: 32px;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export const StyledStem = styled.span`
  color: ${PALETTE.INK_LIGHT};
  font-family: ui-monospace, "Roboto Mono", monospace;
  font-size: 12px;
  overflow-wrap: anywhere;
`;

export const StyledChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;
