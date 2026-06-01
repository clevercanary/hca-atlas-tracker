import { Fragment, JSX, useMemo } from "react";
import { Props } from "./entities";
import { parseValidationMessage } from "./utils";
import { StyledAlert } from "./validationMessage.styles";

/**
 * Pill-styled row that renders a single validation error or warning message,
 * with inline code segments (backtick- or single-quote-delimited) rendered
 * as monospace chips. Strips any leading "ERROR: " / "WARNING: " prefix.
 *
 * Renders with role="listitem" so the surrounding container (role="list" in
 * `ReportContent`) suppresses MUI Alert's implicit assertive live-region
 * behaviour — otherwise dozens of simultaneously-mounted alerts would all
 * announce themselves at once to assistive tech.
 * @param props - Component props.
 * @param props.message - The raw validation message string.
 * @param props.severity - Whether to style the row as an error or a warning.
 * @returns The styled validation message row.
 */
export const ValidationMessage = ({
  message,
  severity,
}: Props): JSX.Element => {
  const segments = useMemo(() => parseValidationMessage(message), [message]);
  return (
    <StyledAlert icon={false} role="listitem" severity={severity}>
      {segments.map((segment, i) =>
        segment.type === "code" ? (
          <code key={i}>{segment.value}</code>
        ) : (
          <Fragment key={i}>{segment.value}</Fragment>
        ),
      )}
    </StyledAlert>
  );
};
