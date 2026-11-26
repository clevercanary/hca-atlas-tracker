import { Alert } from "@databiosphere/findable-ui/lib/components/common/Alert/alert";
import { FluidPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/components/FluidPaper/fluidPaper";
import { sectionPadding } from "@databiosphere/findable-ui/lib/components/common/Section/section.styles";
import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import {
  bpUpMd,
  bpUpSm,
} from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import styled from "@emotion/styled";
import { ButtonBase, Chip, Stack } from "@mui/material";

export const StyledReport = styled(Stack)`
  gap: 24px;
  grid-column: 1 / -1;
  min-width: 0;
`;

export const StyledAlert = styled(Alert)`
  &.MuiAlert-root {
    grid-column: 1 / -1;
  }
`;

export const StyledSection = styled(Stack)`
  gap: 12px;
  min-width: 0;
`;

export const StyledTitleRow = styled(Stack)`
  align-items: center;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px;
`;

export const StyledChip = styled(Chip)`
  align-self: flex-start;
`;

export const StyledTiles = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;

  ${bpUpSm} {
    grid-template-columns: repeat(2, 1fr);
  }

  ${bpUpMd} {
    grid-template-columns: repeat(4, 1fr);
  }
`;

export const StyledTile = styled(FluidPaper)`
  display: flex;
  flex-direction: column;
  gap: 8px;
  ${sectionPadding};
`;

export const StyledCountRow = styled.div`
  display: flex;
  gap: 8px;
  justify-content: space-between;
`;

export const StyledIssue = styled(FluidPaper, {
  shouldForwardProp: (prop) => prop !== "borderColor",
})<{ borderColor: string }>`
  border-left: 4px solid ${({ borderColor }) => borderColor};
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 16px;
`;

export const StyledIssueToggle = styled(ButtonBase)`
  align-items: stretch;
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;

  .MuiSvgIcon-root {
    color: ${PALETTE.INK_LIGHT};
    transition: transform 150ms;
  }

  &[aria-expanded="true"] .MuiSvgIcon-root {
    transform: rotate(90deg);
  }
` as typeof ButtonBase;

export const StyledAffectedFiles = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  list-style: none;
  margin: 6px 0 0;
  padding: 8px 0 0;
  border-top: 1px solid ${PALETTE.SMOKE_MAIN};
`;

export const StyledIssueTop = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;

  > :nth-of-type(2) {
    flex: 1 1 240px;
    min-width: 0;
  }
`;

export const StyledChecks = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr;

  ${bpUpSm} {
    grid-template-columns: repeat(2, 1fr);
  }

  ${bpUpMd} {
    grid-template-columns: repeat(3, 1fr);
  }
`;

export const StyledCheck = styled(FluidPaper)`
  align-items: center;
  display: flex;
  gap: 8px;
  padding: 12px 16px;

  > :nth-of-type(2) {
    flex: 1;
    min-width: 0;
  }

  .MuiSvgIcon-root {
    color: ${PALETTE.SUCCESS_MAIN};
  }
`;

export const StyledFacts = styled(FluidPaper)`
  display: grid;
  gap: 12px 24px;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  margin: 0;
  ${sectionPadding};

  > div {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  dd {
    margin: 0;
    overflow-wrap: anywhere;
  }
`;

export const StyledEvidence = styled.pre`
  background-color: ${PALETTE.SMOKE_LIGHTEST};
  border-radius: 4px;
  font-size: 12px;
  line-height: 18px;
  margin: 0;
  max-height: 160px;
  overflow: auto;
  padding: 8px 10px;
  white-space: pre-wrap;
  word-break: break-word;
`;

export const StyledTablePaper = styled(FluidPaper)`
  overflow-x: auto;

  .MuiTableCell-root {
    white-space: nowrap;
  }
`;
