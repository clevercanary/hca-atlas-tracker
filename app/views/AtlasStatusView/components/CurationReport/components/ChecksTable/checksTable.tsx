import { ProgressLabel } from "@/app/components/Table/components/TableCell/components/TaskCountsCell/taskCountsCell";
import { CountCell } from "@/app/views/AtlasStatusView/components/CurationReport/components/CountCell/countCell";
import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Typography } from "@mui/material";
import { type JSX } from "react";
import { StyledHeadRow, StyledRow } from "./checksTable.styles";
import { type Props } from "./types";

export const ChecksTable = ({
  checks,
  fileCount,
  onFailedClick,
}: Props): JSX.Element => {
  return (
    <>
      <StyledHeadRow>
        <span>Check</span>
        <span>Category</span>
        <span>Files</span>
      </StyledHeadRow>
      {checks.map((check) => {
        const value = fileCount ? (100 * check.passedCount) / fileCount : 0;
        const failedCount = fileCount - check.passedCount;
        return (
          <StyledRow key={check.id}>
            <Typography
              color={TYPOGRAPHY_PROPS.COLOR.INK_MAIN}
              title={check.title}
              variant={TYPOGRAPHY_PROPS.VARIANT.BODY_400}
            >
              {check.detail}
            </Typography>
            <Typography
              color={TYPOGRAPHY_PROPS.COLOR.INK_LIGHT}
              variant={TYPOGRAPHY_PROPS.VARIANT.BODY_400}
            >
              {check.category}
            </Typography>
            <ProgressLabel value={value}>
              <CountCell
                count={failedCount}
                empty={
                  <Typography
                    color={TYPOGRAPHY_PROPS.COLOR.INK_MAIN}
                    variant={TYPOGRAPHY_PROPS.VARIANT.BODY_400}
                  >
                    All pass
                  </Typography>
                }
                onClick={(): void => onFailedClick(check)}
              >
                {failedCount} failed
              </CountCell>
            </ProgressLabel>
          </StyledRow>
        );
      })}
    </>
  );
};
