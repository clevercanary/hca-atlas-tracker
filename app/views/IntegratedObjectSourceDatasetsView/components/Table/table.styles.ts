import { StyledFluidPaper as TableFluidPaper } from "@/app/components/Table/components/TablePaper/tablePaper.styles";
import styled from "@emotion/styled";

/**
 * Background of a hovered or focused row; matches findable-ui's hover for its
 * expandable table rows.
 */
const ROW_HOVER_BACKGROUND_COLOR = "#f8fbfd";

export const StyledFluidPaper = styled(TableFluidPaper)`
  .MuiTableBody-root .MuiTableRow-root {
    &:hover,
    &:focus-within {
      background-color: ${ROW_HOVER_BACKGROUND_COLOR};
    }
  }
`;
