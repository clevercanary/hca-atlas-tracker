import { FluidPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/components/FluidPaper/fluidPaper";
import { FONT } from "@databiosphere/findable-ui/lib/styles/common/constants/font";
import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import styled from "@emotion/styled";

export const StyledKinds = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
`;

// One card per stat, on the tracker's paper like StatusDashboard's MetricCard.
export const StyledKind = styled(FluidPaper)`
  align-content: start;
  display: grid;
  gap: 8px;
  padding: 16px;
`;

export const StyledKindCount = styled.span`
  color: ${PALETTE.INK_MAIN};
  font: ${FONT.HEADING_LARGE};
  font-family: Inter, sans-serif;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
`;

export const StyledLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
`;

export const StyledLegendItem = styled.span`
  align-items: center;
  color: ${PALETTE.INK_LIGHT};
  display: flex;
  font: ${FONT.BODY_SMALL_400};
  gap: 6px;

  &::before {
    background: var(--tone);
    border-radius: 2px;
    content: "";
    height: 8px;
    width: 8px;
  }
`;

export const StyledNote = styled.span`
  color: ${PALETTE.INK_LIGHT};
  font: ${FONT.BODY_SMALL_400};
`;
