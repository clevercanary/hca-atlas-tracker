import { type JSX } from "react";
import { StyledRegion } from "./successAnnouncer.styles";
import { type SuccessAnnouncerProps } from "./types";

/**
 * Announces confirmations, politely, for the success entries on the stack.
 *
 * The region is mounted whether or not there is a confirmation, as
 * `TypographyError` is. A `role="status"` inserted into the DOM together with
 * its text is announced unreliably — screen readers commonly miss an element
 * that appears already populated — whereas text added to a region already in
 * the accessibility tree is announced consistently. A success entry mounts
 * already holding its message, so the `Alert` that shows it carries no live
 * role of its own; this region speaks for it.
 *
 * It mirrors the success entries on the stack, one node per entry. A new
 * confirmation is an addition, which a status region announces, even when its
 * wording matches one already showing; an entry leaving is a removal, which it
 * doesn't, so closing one never re-reads the others.
 * @param props - Component props.
 * @param props.entries - Success entries on the stack, oldest first.
 * @returns the confirmation live region.
 */
export const SuccessAnnouncer = ({
  entries,
}: SuccessAnnouncerProps): JSX.Element => {
  return (
    <StyledRegion role="status">
      {entries.map((entry) => (
        <span key={entry.id}>{entry.message}</span>
      ))}
    </StyledRegion>
  );
};
