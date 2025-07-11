import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Tooltip, Typography } from "@mui/material";
import { Fragment } from "react";
import { StyledAlert, StyledDot } from "./alert.styles";
import { ALERT_PROPS } from "./constants";
import { Props } from "./entities";

export const Alert = ({
  validationReport,
  ...props
}: Props): JSX.Element | null => {
  if (!validationReport.entity_type)
    return (
      <StyledAlert {...ALERT_PROPS} {...props}>
        <Tooltip arrow title={validationReport.message}>
          <Typography noWrap>{validationReport.message}</Typography>
        </Tooltip>
      </StyledAlert>
    );
  return (
    <StyledAlert {...ALERT_PROPS} {...props}>
      {validationReport.primary_key && (
        <Typography variant={TYPOGRAPHY_PROPS.VARIANT.TEXT_BODY_500}>
          {validationReport.primary_key?.replace(/^.*?:\s*/, "")}
        </Typography>
      )}
      {validationReport.column && (
        <Fragment>
          <StyledDot />
          <Tooltip arrow title={validationReport.column}>
            <Typography noWrap>{validationReport.column}</Typography>
          </Tooltip>
        </Fragment>
      )}
      <Fragment>
        <StyledDot />
        <Tooltip arrow title={validationReport.message}>
          <Typography noWrap>{validationReport.message}</Typography>
        </Tooltip>
      </Fragment>
      {validationReport.cell ? (
        <Fragment>
          <StyledDot />
          <code>{validationReport.cell}</code>
        </Fragment>
      ) : validationReport.row ? (
        <Fragment>
          <StyledDot />
          <code>row {validationReport.row + 1}</code>
        </Fragment>
      ) : null}
    </StyledAlert>
  );
};
