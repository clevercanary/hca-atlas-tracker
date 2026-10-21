import { StyledFluidPaper as TableFluidPaper } from "@/app/components/Table/components/TablePaper/tablePaper.styles";
import { css } from "@emotion/react";
import styled from "@emotion/styled";

interface Props {
  isRowActionable: boolean;
}

/**
 * Background of a hovered or focused row; matches findable-ui's hover for its
 * expandable table rows.
 */
const ROW_HOVER_BACKGROUND_COLOR = "#f8fbfd";

export const StyledFluidPaper = styled(TableFluidPaper, {
  shouldForwardProp: (prop) => prop !== "isRowActionable",
})<Props>`
  ${({ isRowActionable }) =>
    isRowActionable &&
    css`
      .MuiTableBody-root .MuiTableRow-root {
        &:hover,
        &:focus-within {
          background-color: ${ROW_HOVER_BACKGROUND_COLOR};
        }
      }
    `}
`;
