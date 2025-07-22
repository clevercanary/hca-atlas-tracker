import { OpenInNewIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/OpenInNewIcon/openInNewIcon";
import {
  ANCHOR_TARGET,
  REL_ATTRIBUTE,
} from "@databiosphere/findable-ui/lib/components/Links/common/entities";
import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/button";
import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Button, Divider, Typography } from "@mui/material";
import { Fragment, useMemo, useState } from "react";
import { buildSheetsUrl } from "../../../../../../utils/google-sheets";
import { COLUMN_KEY, MAX_REPORTS_TO_DISPLAY } from "../../constants";
import { Alert } from "../Alert/alert";
import { ENTITY_NAME, GRID_PROPS } from "./constants";
import { Props } from "./entities";
import {
  StyledFluidPaper,
  StyledGrid,
  StyledTypography,
} from "./entityValidationReport.styles";
import { getEntityReportCount } from "./utils";

export const EntityValidationReport = ({
  columnValidationReports,
  entityType,
  entrySheetId,
}: Props): JSX.Element => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    [COLUMN_KEY.OTHER]: true, // "other" column is expanded by default
  });
  const entityCount = useMemo(
    () => getEntityReportCount(columnValidationReports),
    [columnValidationReports]
  );
  return (
    <StyledFluidPaper elevation={0}>
      <StyledTypography
        component="h3"
        variant={TYPOGRAPHY_PROPS.VARIANT.TEXT_BODY_500}
      >
        {ENTITY_NAME[entityType]} ({entityCount})
      </StyledTypography>
      <StyledGrid {...GRID_PROPS}>
        {[...columnValidationReports.entries()].map(
          ([column, validationReports], j) => {
            const isExpanded = expanded[column];
            const reports = isExpanded
              ? validationReports
              : validationReports.slice(0, MAX_REPORTS_TO_DISPLAY);
            const reportCount = validationReports.length;
            return (
              <Fragment key={column}>
                {j > 0 && <Divider />}
                <Typography
                  component="div"
                  gutterBottom
                  variant={TYPOGRAPHY_PROPS.VARIANT.TEXT_BODY_500}
                >
                  {column === COLUMN_KEY.OTHER ? "Other errors" : column} (
                  {reportCount})
                </Typography>
                {reports.map((report, k) => (
                  <Alert
                    key={k}
                    action={
                      <Button
                        color={BUTTON_PROPS.COLOR.INHERIT}
                        endIcon={<OpenInNewIcon />}
                        variant={BUTTON_PROPS.VARIANT.TEXT}
                      >
                        Open
                      </Button>
                    }
                    onClick={() => {
                      window.open(
                        buildSheetsUrl(
                          entrySheetId,
                          report.worksheet_id,
                          report.cell,
                          report.row
                        ),
                        ANCHOR_TARGET.BLANK,
                        REL_ATTRIBUTE.NO_OPENER_NO_REFERRER
                      );
                    }}
                    validationReport={report}
                  />
                ))}
                {column !== COLUMN_KEY.OTHER &&
                  reportCount > MAX_REPORTS_TO_DISPLAY && (
                    <Button
                      color={BUTTON_PROPS.COLOR.PRIMARY}
                      onClick={() =>
                        setExpanded((e) => ({ ...e, [column]: !isExpanded }))
                      }
                      variant={BUTTON_PROPS.VARIANT.TEXT}
                    >
                      Show {isExpanded ? "less" : "more"}
                    </Button>
                  )}
              </Fragment>
            );
          }
        )}
      </StyledGrid>
    </StyledFluidPaper>
  );
};
