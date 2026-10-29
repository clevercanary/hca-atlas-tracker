import { type RefObject } from "react";

/**
 * Ref to no element, for the pinned column head's width observer when the
 * table scrolls in its own box and has no pinned head to keep aligned.
 */
export const NO_ELEMENT_REF: RefObject<HTMLDivElement | null> = {
  current: null,
};
