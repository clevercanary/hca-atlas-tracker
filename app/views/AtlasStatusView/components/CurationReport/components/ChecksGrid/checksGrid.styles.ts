import { FluidPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/components/FluidPaper/fluidPaper";
import { bpUpMd } from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import styled from "@emotion/styled";
import { Stack } from "@mui/material";

export const StyledGroup = styled(Stack)`
  gap: 8px;
`;

export const StyledGrid = styled.div`
  display: grid;
  gap: 8px;
  grid-template-columns: 1fr;

  ${bpUpMd} {
    grid-template-columns: repeat(3, 1fr);
  }
`;

export const StyledCheck = styled(FluidPaper)`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 16px;
`;

export const StyledCheckTitle = styled.div`
  align-items: center;
  display: grid;
  gap: 8px;
  grid-template-columns: auto 1fr auto;
`;
