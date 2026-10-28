import { StyledTableScroll as DXStyledTableScroll } from "@databiosphere/findable-ui/lib/components/Table/table.styles";
import styled from "@emotion/styled";

// The paper draws the line above the table: its own top border, or the divider
// below the toolbar.
export const StyledTableScroll = styled(DXStyledTableScroll)`
  border-top: none;
`;
