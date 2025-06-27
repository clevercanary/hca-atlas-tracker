import { OpenInNewIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/OpenInNewIcon/openInNewIcon";
import {
  ANCHOR_TARGET,
  REL_ATTRIBUTE,
} from "@databiosphere/findable-ui/lib/components/Links/common/entities";
import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/button";
import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Button, Divider, Grid, Typography } from "@mui/material";
import { buildSheetsUrl } from "../../../Actions/utils";
import { Alert } from "../Alert/alert";
import { ENTITY_NAME, GRID_PROPS } from "./constants";
import { Props } from "./entities";
import { StyledFluidPaper } from "./entityValidationReport.styles";

export const EntityValidationReport = ({
  entityType,
  entrySheetId,
  validationReports,
}: Props): JSX.Element => {
  return (
    <StyledFluidPaper>
      <Typography
        component="h3"
        variant={TYPOGRAPHY_PROPS.VARIANT.TEXT_BODY_500}
      >
        {ENTITY_NAME[entityType]}
      </Typography>
      <Divider />
      <Grid {...GRID_PROPS}>
        <Typography variant={TYPOGRAPHY_PROPS.VARIANT.TEXT_BODY_400}>
          Errors found ({validationReports.length}):
        </Typography>
        {validationReports.map((validationReport, j) => {
          return (
            <Alert
              key={j}
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
                    validationReport.worksheet_id,
                    validationReport.cell,
                    validationReport.row
                  ),
                  ANCHOR_TARGET.BLANK,
                  REL_ATTRIBUTE.NO_OPENER_NO_REFERRER
                );
              }}
              validationReport={validationReport}
            />
          );
        })}
      </Grid>
    </StyledFluidPaper>
  );
};
