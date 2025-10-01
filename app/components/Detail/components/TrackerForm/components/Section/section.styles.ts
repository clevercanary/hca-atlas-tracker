import { FluidPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/components/FluidPaper/fluidPaper";
import { sectionPadding } from "@databiosphere/findable-ui/lib/components/common/Section/section.styles";
import { Table as CommonTable } from "@databiosphere/findable-ui/lib/components/Detail/components/Table/table";
import { FONT } from "@databiosphere/findable-ui/lib/styles/common/constants/font";
import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import {
  mediaDesktopSmallUp,
  mediaDesktopUp,
  mediaTabletUp,
} from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import { css } from "@emotion/react";
import styled from "@emotion/styled";

export interface SectionProps {
  fullWidth?: boolean;
}

export const Section = styled.div<SectionProps>`
  align-items: flex-start;
  display: grid;
  gap: 16px;
  grid-column: 1 / -1;
  grid-template-columns: ${({ fullWidth }) => (fullWidth ? "1fr" : "inherit")};

  ${mediaTabletUp} {
    gap: inherit;
  }
`;

export const SectionHero = styled("div")<SectionProps>`
  display: grid;
  gap: 8px;
  padding: 0 16px;

  ${mediaTabletUp} {
    grid-column: ${({ fullWidth }) => (fullWidth ? "1 / -1" : "span 4")};
    padding: 0;
  }

  ${mediaDesktopUp} {
    grid-column: ${({ fullWidth }) => (fullWidth ? "1 / -1" : "1")};
  }
`;

export const SectionTitle = styled.h3`
  font: ${FONT.BODY_LARGE_500};
  font-weight: 600;
  margin: 0;
`;

export const SectionText = styled.div`
  color: ${PALETTE.INK_LIGHT};
  font: ${FONT.BODY_400};
  font-size: 13px;

  ${mediaDesktopSmallUp} {
    max-width: 400px;
  }
`;

export const SectionCard = styled(FluidPaper, {
  shouldForwardProp: (prop) =>
    prop !== "gridAutoFlow" &&
    prop !== "formManager" &&
    prop !== "formMethod" &&
    prop !== "fullWidth",
})<SectionProps & { gridAutoFlow?: "dense" | "unset" }>`
  ${sectionPadding};
  display: grid;
  gap: 20px;
  grid-template-columns: 1fr;

  ${mediaTabletUp} {
    grid-column: ${({ fullWidth }) => (fullWidth ? "1 / -1" : "6 / span 7")};
  }

  ${mediaDesktopSmallUp} {
    grid-template-columns: 1fr 1fr;
  }

  ${mediaDesktopUp} {
    grid-column: 1 / -1;

    ${({ fullWidth }) =>
      !fullWidth &&
      css`
        grid-column: 2;
        margin: 0 auto;
        max-width: 712px;
        width: 100%;
      `}
  }

  ${({ gridAutoFlow }) =>
    gridAutoFlow &&
    css`
      grid-auto-flow: ${gridAutoFlow};
    `}
`;

export const SectionTable = styled(CommonTable)`
  .MuiTable-root {
    .MuiTableBody-root {
      .MuiTableRow-root[id^="sub-row"] {
        .MuiTableCell-root:first-of-type {
          padding-left: 46px;
        }
      }
    }
  }
` as typeof CommonTable;
