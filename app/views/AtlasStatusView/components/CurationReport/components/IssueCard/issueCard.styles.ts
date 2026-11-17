import { FluidPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/components/FluidPaper/fluidPaper";
import { sectionPadding } from "@databiosphere/findable-ui/lib/components/common/Section/section.styles";
import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import styled from "@emotion/styled";
import { Stack } from "@mui/material";

export const StyledCard = styled(FluidPaper)`
  overflow: hidden;
  width: 100%;
`;

export const StyledContent = styled(Stack)`
  gap: 8px;
  ${sectionPadding};
`;

export const StyledHeader = styled.div`
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  justify-content: space-between;
`;

export const StyledTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

export const StyledEvidence = styled.pre`
  background-color: ${PALETTE.SMOKE_LIGHTEST};
  border: 1px solid ${PALETTE.SMOKE_MAIN};
  border-radius: 4px;
  font-family: ui-monospace, "Roboto Mono", monospace;
  font-size: 12px;
  line-height: 18px;
  margin: 0;
  overflow-wrap: anywhere;
  padding: 8px 12px;
  white-space: pre-wrap;
`;
