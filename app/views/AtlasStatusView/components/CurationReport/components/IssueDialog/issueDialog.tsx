import { FileList } from "@/app/views/AtlasStatusView/components/CurationReport/components/FileList/fileList";
import {
  getOwnerLabel,
  getPriorityChip,
} from "@/app/views/AtlasStatusView/components/CurationReport/utils";
import { DialogTitle } from "@databiosphere/findable-ui/lib/components/common/Dialog/components/DialogTitle/dialogTitle";
import { CHIP_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/chip";
import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Chip, DialogContent, Typography } from "@mui/material";
import { type JSX } from "react";
import { VARIED_DETAIL_NOTE } from "./constants";
import { StyledDialog, StyledTags } from "./issueDialog.styles";
import { type Props } from "./types";

export const IssueDialog = ({
  issue,
  onClose,
  statusUrl,
}: Props): JSX.Element => {
  // The whole issue, not just the files the table's filters leave.
  const files = issue?.allFiles ?? issue?.files ?? [];
  return (
    <StyledDialog
      fullWidth
      maxWidth="sm"
      onClose={onClose}
      open={Boolean(issue)}
    >
      {issue && (
        <>
          <DialogTitle onClose={onClose} title={issue.title} />
          <DialogContent dividers>
            <StyledTags>
              <Chip
                {...getPriorityChip(issue)}
                variant={CHIP_PROPS.VARIANT.STATUS}
              />
              {issue.who && <Chip label={getOwnerLabel(issue.who)} />}
              {issue.tool && <Chip label={issue.tool} />}
            </StyledTags>
            <Typography
              color={TYPOGRAPHY_PROPS.COLOR.INK_MAIN}
              variant={TYPOGRAPHY_PROPS.VARIANT.BODY_400_2_LINES}
            >
              {issue.detail || VARIED_DETAIL_NOTE}
            </Typography>
            <Typography
              color={TYPOGRAPHY_PROPS.COLOR.INK_LIGHT}
              variant={TYPOGRAPHY_PROPS.VARIANT.BODY_SMALL_500}
            >
              {files.length} affected {files.length === 1 ? "file" : "files"}
            </Typography>
            <FileList files={files} statusUrl={statusUrl} />
          </DialogContent>
        </>
      )}
    </StyledDialog>
  );
};
