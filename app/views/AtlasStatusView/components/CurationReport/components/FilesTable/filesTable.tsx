import {
  FILE_KIND_LABEL,
  PRIORITIES,
  VERDICT_CHIP,
  VERDICT_LABEL,
} from "@/app/views/AtlasStatusView/components/CurationReport/constants";
import {
  StyledSection,
  StyledTablePaper,
} from "@/app/views/AtlasStatusView/components/CurationReport/curationReport.styles";
import { type FileRow } from "@/app/views/AtlasStatusView/components/CurationReport/types";
import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import {
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { type JSX } from "react";

interface Props {
  fileRows: FileRow[];
  getFileHref: (fileStem?: string) => string;
}

export const FilesTable = ({ fileRows, getFileHref }: Props): JSX.Element => (
  <StyledSection>
    <Typography
      color={TYPOGRAPHY_PROPS.COLOR.INK_MAIN}
      component="h3"
      variant={TYPOGRAPHY_PROPS.VARIANT.HEADING_XSMALL}
    >
      Files
    </Typography>
    <StyledTablePaper elevation={0}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Kind</TableCell>
            <TableCell>Verdict</TableCell>
            <TableCell align="right">Cells</TableCell>
            {PRIORITIES.map((priority) => (
              <TableCell align="right" key={priority}>
                P{priority}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {fileRows.map((row) => (
            <TableRow key={row.fileStem}>
              <TableCell>
                <Link href={getFileHref(row.fileStem)}>{row.displayName}</Link>
              </TableCell>
              <TableCell>{FILE_KIND_LABEL[row.kind]}</TableCell>
              <TableCell>
                <Chip
                  color={VERDICT_CHIP[row.verdict]}
                  label={VERDICT_LABEL[row.verdict]}
                />
              </TableCell>
              <TableCell align="right">
                {row.cells.toLocaleString("en-US")}
              </TableCell>
              {PRIORITIES.map((priority) => (
                <TableCell align="right" key={priority}>
                  {row.priorities[priority]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </StyledTablePaper>
  </StyledSection>
);
