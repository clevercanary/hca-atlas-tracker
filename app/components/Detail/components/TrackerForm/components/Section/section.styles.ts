import { FluidPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/components/FluidPaper/fluidPaper";
import { sectionPadding } from "@databiosphere/findable-ui/lib/components/common/Section/section.styles";
import { Table as CommonTable } from "@databiosphere/findable-ui/lib/components/Detail/components/Table/table";
import {
  mediaDesktopSmallUp,
  mediaDesktopUp,
  mediaTabletUp,
} from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import { inkLight } from "@databiosphere/findable-ui/lib/styles/common/mixins/colors";
import {
  textBody400,
  textBodyLarge500,
} from "@databiosphere/findable-ui/lib/styles/common/mixins/fonts";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import {
  RESPONSIVE_BREAKPOINT,
  RESPONSIVE_BREAKPOINT_RANGE,
} from "../../../../../Layout/components/Detail/constants";
import {
  SECTION_CONTENT_MARGIN,
  SECTION_CONTENT_MARGIN_RANGE,
} from "./constants";

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

  ${mediaDesktopSmallUp} {
    grid-column: ${({ fullWidth }) => (fullWidth ? "1 / -1" : "1")};
  }
`;

export const SectionTitle = styled.h3`
  ${textBodyLarge500};
  font-weight: 600;
  margin: 0;
`;

export const SectionText = styled.div`
  ${textBody400};
  color: ${inkLight};
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
    grid-column: 1 / -1;
    grid-template-columns: 1fr 1fr;

    ${({ fullWidth }) =>
      !fullWidth &&
      css`
        grid-column: 2;
        margin: 0 auto 0
          clamp(
            ${SECTION_CONTENT_MARGIN.MIN}px,
            calc(
              ${SECTION_CONTENT_MARGIN.MAX}px -
                (
                  ${SECTION_CONTENT_MARGIN_RANGE} *
                    (100vw - ${RESPONSIVE_BREAKPOINT.START}px) /
                    ${RESPONSIVE_BREAKPOINT_RANGE}
                )
            ),
            ${SECTION_CONTENT_MARGIN.MAX}px
          );
        max-width: 712px;
        width: 100%;
      `}
  }

  ${mediaDesktopUp} {
    ${({ fullWidth }) =>
      !fullWidth &&
      css`
        margin: 0 auto;
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
