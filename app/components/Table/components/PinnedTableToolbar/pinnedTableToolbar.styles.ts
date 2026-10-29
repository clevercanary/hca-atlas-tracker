import { TABLE_PAPER_TOP } from "@/app/components/Table/components/TablePaper/constants";
import { StyledToolbar as BaseStyledToolbar } from "@/app/components/Table/components/TableToolbar/tableToolbar.styles";
import { SUPPORTS_SCROLL_DRIVEN_ANIMATIONS } from "@databiosphere/findable-ui/lib/styles/common/constants/supports";
import { bpUpSm } from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import {
  pinned,
  pinnedFocus,
} from "@databiosphere/findable-ui/lib/styles/common/mixins/pinned";
import styled from "@emotion/styled";

// From sm up, where the page scrolls, the toolbar and its divider pin above the
// table's column head, so its actions stay in reach as the rows scroll; below
// sm it scrolls away with the page, leaving the screen to the table.
export const StyledPinnedTableToolbar = styled.div`
  @supports ${SUPPORTS_SCROLL_DRIVEN_ANIMATIONS} {
    ${bpUpSm} {
      z-index: 3; /* above the rows, below the paper's pinned top edge */
      ${pinned(`var(${TABLE_PAPER_TOP})`)};
      ${pinnedFocus};
    }
  }
`;

export const StyledToolbar = styled(BaseStyledToolbar)`
  &.MuiToolbar-root {
    min-height: 68px;
  }
`;
