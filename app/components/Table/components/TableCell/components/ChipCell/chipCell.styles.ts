import { ChipCell } from "@databiosphere/findable-ui/lib/components/Table/components/TableCell/components/ChipCell/ChipCell";
import styled from "@emotion/styled";

export const StyledChipCell = styled(ChipCell)`
  gap: 4px;
  padding: 0 8px;

  .MuiChip-icon {
    font-size: 12px;
    margin: 0 0 0 -4px;
  }

  .MuiChip-label {
    padding: 0;
  }
` as typeof ChipCell;
