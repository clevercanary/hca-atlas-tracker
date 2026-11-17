import { Tooltip } from "@mui/material";
import { type JSX } from "react";
import { StyledLine, StyledSegment } from "./summaryLine.styles";
import { type Props, type SummarySegment } from "./types";

export const SummaryLine = ({ segments }: Props): JSX.Element => {
  const shown = segments.filter(({ count }) => count);
  return (
    <StyledLine aria-label={shown.map(getTitle).join(", ")} role="img">
      {shown.map((segment) => (
        <Tooltip
          key={segment.label}
          arrow
          placement="top"
          title={getTitle(segment)}
        >
          <StyledSegment
            style={{ backgroundColor: segment.color, flexGrow: segment.count }}
          />
        </Tooltip>
      ))}
    </StyledLine>
  );
};

/**
 * Hover and screen-reader text of a segment.
 * @param segment - Segment.
 * @param segment.count - Segment count.
 * @param segment.label - Segment label.
 * @returns Text, e.g. "Publish ready: 9".
 */
function getTitle({ count, label }: SummarySegment): string {
  return `${label}: ${count}`;
}
