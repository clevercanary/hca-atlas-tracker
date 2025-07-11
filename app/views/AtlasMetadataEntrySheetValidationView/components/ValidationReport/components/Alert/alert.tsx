import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Tooltip, Typography } from "@mui/material";
import { Fragment } from "react";
import { isValueString } from "../../../../../../utils/typeGuards";
import { StyledAlert, StyledDot } from "./alert.styles";
import { ALERT_PROPS } from "./constants";
import { Props } from "./entities";

export const Alert = ({
  validationReport,
  ...props
}: Props): JSX.Element | null => {
  const {
    cell,
    column,
    input: rawInput,
    message,
    primary_key,
    row,
  } = validationReport;
  const input = rawInput ?? "";
  if (!validationReport.entity_type)
    return (
      <StyledAlert {...ALERT_PROPS} {...props}>
        <Tooltip arrow title={message}>
          <Typography noWrap>{message}</Typography>
        </Tooltip>
      </StyledAlert>
    );
  return (
    <StyledAlert {...ALERT_PROPS} {...props}>
      {primary_key && (
        <Typography variant={TYPOGRAPHY_PROPS.VARIANT.TEXT_BODY_500}>
          {primary_key?.replace(/^.*?:\s*/, "")}
        </Typography>
      )}
      {column && (
        <Fragment>
          <StyledDot />
          <Tooltip arrow title={column}>
            <Typography noWrap>{column}</Typography>
          </Tooltip>
        </Fragment>
      )}
      {isValueString(input) && (
        <Fragment>
          <StyledDot />
          <Tooltip arrow title={`Input is &quot;${input}&quot;`}>
            <Typography noWrap>Input is &quot;{input}&quot;</Typography>
          </Tooltip>
        </Fragment>
      )}
      <Fragment>
        <StyledDot />
        <Tooltip arrow title={message}>
          <Typography noWrap>{message}</Typography>
        </Tooltip>
      </Fragment>
      {cell ? (
        <Fragment>
          <StyledDot />
          <code>{cell}</code>
        </Fragment>
      ) : row ? (
        <Fragment>
          <StyledDot />
          <code>row {row + 1}</code>
        </Fragment>
      ) : null}
    </StyledAlert>
  );
};
