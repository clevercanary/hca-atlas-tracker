import { FluidPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/components/FluidPaper/fluidPaper";
import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import { SUPPORTS_SCROLL_DRIVEN_ANIMATIONS } from "@databiosphere/findable-ui/lib/styles/common/constants/supports";
import { bpUpSm } from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import { pinned } from "@databiosphere/findable-ui/lib/styles/common/mixins/pinned";
import styled from "@emotion/styled";
import { TABLE_PAPER_TOP } from "./constants";

export const StyledFluidPaper = styled(FluidPaper)`
  display: grid;
  grid-column: 1 / -1;
  overflow: clip; /* not hidden: a scroll container would stop the column head pinning to the page */

  @supports not ${SUPPORTS_SCROLL_DRIVEN_ANIMATIONS} {
    overflow: hidden;
  }

  /* Where the column head pins (a page scroll table, from sm up), a band pins
     above it, as on findable-ui's index view: it draws the table's rounded top
     edge over the pinned toolbar, or else the pinned head, and masks the rows
     scrolling past its corners.
     At rest it lies on the paper's own top edge. It is drawn inside the paper,
     so the paper's clip is widened by its 1px border for the band to cover it. */
  @supports ${SUPPORTS_SCROLL_DRIVEN_ANIMATIONS} {
    ${bpUpSm} {
      &:has(> div > .MuiTableContainer-root) {
        overflow-clip-margin: 1px;

        &::before {
          border: 1px solid ${PALETTE.SMOKE_MAIN};
          border-bottom: none;
          border-radius: 8px 8px 0 0;
          box-shadow: 0 -8px 0 8px ${PALETTE.BACKGROUND_DEFAULT};
          content: "";
          height: 8px;
          margin: -1px -1px -8px;
          pointer-events: none;
          z-index: 4; /* above the toolbar and the column head, including its pinned copy */
          ${pinned(`var(${TABLE_PAPER_TOP})`)};
        }
      }
    }
  }
`;
