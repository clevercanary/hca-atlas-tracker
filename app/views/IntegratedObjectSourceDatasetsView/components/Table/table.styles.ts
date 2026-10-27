import { StyledFluidPaper as TableFluidPaper } from "@/app/components/Table/components/TablePaper/tablePaper.styles";
import styled from "@emotion/styled";

/**
 * Background of a hovered or focused row; matches findable-ui's hover for its
 * expandable table rows.
 */
const ROW_HOVER_BACKGROUND_COLOR = "#f8fbfd";

/**
 * Opacity of the cells of a row whose unlink is in flight. The cells are dimmed
 * rather than the row: the table draws its grid lines as gaps over a grey
 * container, which a translucent row would let show through.
 */
const ROW_PENDING_OPACITY = 0.5;

export const StyledFluidPaper = styled(TableFluidPaper)`
  .MuiTableBody-root .MuiTableRow-root {
    &:hover,
    &:focus-within {
      background-color: ${ROW_HOVER_BACKGROUND_COLOR};
    }

    &:has([aria-busy="true"]) .MuiTableCell-root {
      opacity: ${ROW_PENDING_OPACITY};
    }
  }
`;
