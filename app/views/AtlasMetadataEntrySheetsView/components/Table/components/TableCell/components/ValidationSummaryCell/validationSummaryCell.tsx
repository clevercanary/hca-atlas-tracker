import { CHIP_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/chip";
import { Chip, Grid, Link as MLink } from "@mui/material";
import { CellContext } from "@tanstack/react-table";
import Link from "next/link";
import { ROUTE } from "../../../../../../../../routes/constants";
import { MetadataEntrySheet } from "../../../../../../entities";
import { ValidationSummaryCellProps } from "./types";
import {
  getErrorCountColor,
  getErrorCountIcon,
  getErrorCountLabel,
} from "./utils";

export const ValidationSummaryCell = ({
  getValue,
}: CellContext<
  MetadataEntrySheet,
  ValidationSummaryCellProps
>): JSX.Element | null => {
  const { atlasId, entrySheetValidationId, errorCount } = getValue();
  return (
    <Grid container direction="column" gap={1}>
      <Chip
        color={getErrorCountColor(errorCount)}
        icon={getErrorCountIcon(errorCount)}
        label={getErrorCountLabel(errorCount)}
        variant={CHIP_PROPS.VARIANT.STATUS}
      />
      {errorCount > 0 && (
        <MLink
          component={Link}
          href={{
            pathname: ROUTE.METADATA_ENTRY_SHEET,
            query: { atlasId, entrySheetValidationId },
          }}
        >
          View Report
        </MLink>
      )}
    </Grid>
  );
};
