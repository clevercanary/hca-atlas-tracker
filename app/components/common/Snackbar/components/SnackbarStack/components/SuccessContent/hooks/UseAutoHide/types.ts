import { type FocusEventHandler, type MouseEventHandler } from "react";
import { type AUTO_HIDE_HOLD } from "./constants";

export type AutoHideHold = (typeof AUTO_HIDE_HOLD)[keyof typeof AUTO_HIDE_HOLD];

export type AutoHideTimer = ReturnType<typeof setTimeout> | undefined;

/** Handlers to spread on the entry's root, which hold the timer while used. */
export interface UseAutoHide {
  onBlur: FocusEventHandler;
  onFocus: FocusEventHandler;
  onMouseEnter: MouseEventHandler;
  onMouseLeave: MouseEventHandler;
}
