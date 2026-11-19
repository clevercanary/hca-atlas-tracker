import { CountCell } from "@/app/views/AtlasStatusView/components/CurationReport/components/CountCell/countCell";
import { StyledRowTitle } from "@/app/views/AtlasStatusView/components/CurationReport/components/TableCard/tableCard.styles";
import {
  FILE_KIND_LABEL,
  PRIORITIES,
  VERDICT_COLOR,
  VERDICT_LABEL,
} from "@/app/views/AtlasStatusView/components/CurationReport/constants";
import {
  countPriority,
  getFileUrl,
} from "@/app/views/AtlasStatusView/components/CurationReport/utils";
import { CHIP_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/chip";
import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Chip, Link, Typography } from "@mui/material";
import NextLink from "next/link";
import { type JSX } from "react";
import { StyledHeadRow, StyledRow } from "./filesTable.styles";
import { type Props } from "./types";

export const FilesTable = ({
  files,
  onCountClick,
  statusUrl,
}: Props): JSX.Element => {
  return (
    <>
      <StyledHeadRow>
        <span>File</span>
        <span>Kind</span>
        <span>State</span>
        <span>Blocks</span>
        <span>Should fix</span>
        <span>Check</span>
      </StyledHeadRow>
      {files.map((file) => (
        <StyledRow key={file.fileStem}>
          <StyledRowTitle>
            <Link
              component={NextLink}
              href={getFileUrl(statusUrl, file.fileStem)}
              variant={TYPOGRAPHY_PROPS.VARIANT.BODY_400}
            >
              {file.displayName}
            </Link>
          </StyledRowTitle>
          <Typography
            color={TYPOGRAPHY_PROPS.COLOR.INK_LIGHT}
            variant={TYPOGRAPHY_PROPS.VARIANT.BODY_400}
          >
            {FILE_KIND_LABEL[file.kind]}
          </Typography>
          <span>
            <Chip
              color={VERDICT_COLOR[file.verdict]}
              label={VERDICT_LABEL[file.verdict]}
              variant={CHIP_PROPS.VARIANT.STATUS}
            />
          </span>
          {PRIORITIES.map((priority) => {
            const count = countPriority(file, priority);
            return (
              <CountCell
                key={priority}
                count={count}
                onClick={(): void => onCountClick(file, priority)}
              >
                {count}
              </CountCell>
            );
          })}
        </StyledRow>
      ))}
    </>
  );
};
