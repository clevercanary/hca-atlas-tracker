import {
  ANCHOR_TARGET,
  REL_ATTRIBUTE,
} from "@databiosphere/findable-ui/lib/components/Links/common/entities";
import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Link, Tooltip, Typography } from "@mui/material";
import { Fragment, JSX } from "react";
import slugify from "slugify";
import { isValueString } from "../../../../../../utils/typeGuards";
import { StyledAlert, StyledDot } from "./alert.styles";
import { ALERT_PROPS } from "./constants";
import { Props } from "./entities";

export const Alert = ({
  metadataUrl,
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
        <Typography variant={TYPOGRAPHY_PROPS.VARIANT.BODY_500}>
          {primary_key?.replace(/^.*?:\s*/, "")}
        </Typography>
      )}
      {column && (
        <Fragment>
          <StyledDot />
          <Tooltip arrow title={column}>
            <Link
              color="inherit"
              href={`${metadataUrl}#${slugify(column)}`}
              onClick={(e) => e.stopPropagation()}
              rel={REL_ATTRIBUTE.NO_OPENER_NO_REFERRER}
              target={ANCHOR_TARGET.BLANK}
            >
              {column}
            </Link>
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
      {getCellOrRowDetail(cell, row)}
    </StyledAlert>
  );
};

/**
 * Get the location detail for a validation report, preferring the cell
 * reference and falling back to the (1-based) row number.
 * @param cell - Cell reference, if any.
 * @param row - Zero-based row index, if any.
 * @returns Location detail element, or null when neither is present.
 */
function getCellOrRowDetail(
  cell: string | null,
  row: number | null,
): JSX.Element | null {
  if (cell)
    return (
      <Fragment>
        <StyledDot />
        <code>{cell}</code>
      </Fragment>
    );
  if (row)
    return (
      <Fragment>
        <StyledDot />
        <code>row {row + 1}</code>
      </Fragment>
    );
  return null;
}
