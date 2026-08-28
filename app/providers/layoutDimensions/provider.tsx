import {
  getBorderBoxSizeHeight,
  useResizeObserver,
} from "@databiosphere/findable-ui/lib/hooks/useResizeObserver";
import { LayoutDimensionsContext } from "@databiosphere/findable-ui/lib/providers/layoutDimensions/context";
import {
  type LayoutDimensions,
  type LayoutDimensionsProviderProps,
} from "@databiosphere/findable-ui/lib/providers/layoutDimensions/types";
import { type JSX, useRef } from "react";
import { INITIAL_LAYOUT_DIMENSIONS } from "./constants";

/**
 * Layout dimensions provider that falls back to {@link INITIAL_LAYOUT_DIMENSIONS}
 * instead of zero until the `ResizeObserver` reports.
 *
 * Stands in for findable-ui's `LayoutDimensionsProvider`, which is identical
 * apart from falling back to `0`. That zero is the whole of #1543: the observer
 * cannot run before the server-rendered paint, so `<main>` ships with
 * `margin-top: 0px` and every consumer of `dimensions` renders once with the
 * header offset missing, then jumps ~57px on the first client commit. No
 * JS-timing fix reaches it — `useLayoutEffect`, measuring earlier, seeding on
 * mount all run after that paint — so the fallback itself has to be right.
 *
 * Deliberately a copy rather than a wrapper: the fallback is applied where the
 * observer result is read, so it cannot be overridden from outside. It is small
 * and its shape is typed against upstream's `LayoutDimensions`, so a change to
 * that shape fails the build rather than drifting silently.
 *
 * Intended to be temporary. The upstream fix is the same fallback taken as a
 * prop (defaulting to today's zeros, so it stays backwards-compatible), at
 * which point this file is deleted and the seed is passed to findable-ui's
 * provider instead. If DataBiosphere/findable-ui#998 lands — the header
 * participating in layout rather than `position: fixed` — the offset disappears
 * entirely and neither is needed.
 * @param props - Provider props.
 * @param props.children - Children components.
 * @returns Layout dimensions provider.
 */
export function LayoutDimensionsProvider({
  children,
}: LayoutDimensionsProviderProps): JSX.Element {
  const footerRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const footerRect = useResizeObserver(footerRef, getBorderBoxSizeHeight);
  const headerRect = useResizeObserver(headerRef, getBorderBoxSizeHeight);

  const dimensions: LayoutDimensions = {
    footer: {
      height: footerRect?.height ?? INITIAL_LAYOUT_DIMENSIONS.footer.height,
    },
    header: {
      height: headerRect?.height ?? INITIAL_LAYOUT_DIMENSIONS.header.height,
    },
  };

  return (
    <LayoutDimensionsContext.Provider
      value={{ dimensions, footerRef, headerRef }}
    >
      {children}
    </LayoutDimensionsContext.Provider>
  );
}
