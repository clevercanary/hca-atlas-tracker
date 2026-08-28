import {
  getBorderBoxSizeHeight,
  useResizeObserver,
} from "@databiosphere/findable-ui/lib/hooks/useResizeObserver";
import { LayoutDimensionsContext } from "@databiosphere/findable-ui/lib/providers/layoutDimensions/context";
import {
  type LayoutDimensions,
  type LayoutDimensionsProviderProps,
} from "@databiosphere/findable-ui/lib/providers/layoutDimensions/types";
import { type JSX, useMemo, useRef } from "react";
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
 * and typed against upstream's `LayoutDimensions`, so a *required* addition to
 * that shape fails the build. Optional additions and behavioural changes do
 * not: an optional field (say a `mainRef` some new upstream component attaches
 * to) or a change to how upstream observes would compile clean here and simply
 * never be supplied, discoverable only by diffing against `node_modules`. The
 * mitigation is the same as the reason this file is temporary — keep it short
 * and delete it once the seed lands upstream as a prop.
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

  const footerHeight =
    footerRect?.height ?? INITIAL_LAYOUT_DIMENSIONS.footer.height;
  const headerHeight =
    headerRect?.height ?? INITIAL_LAYOUT_DIMENSIONS.header.height;

  // Memoized on the two heights (the refs are stable) so the observer's first
  // report is a no-op for consumers. Seeding is what makes that possible: the
  // report usually confirms the seed, and without this the fresh context object
  // would still re-render Main, ContentLayout's grids, SidebarPositioner,
  // Footer and the app's Content, re-serializing emotion styles into
  // byte-identical DOM. Upstream can't do this — its fallback of 0 is never the
  // measured value, so its first report always is a real change.
  const value = useMemo(() => {
    const dimensions: LayoutDimensions = {
      footer: { height: footerHeight },
      header: { height: headerHeight },
    };
    return { dimensions, footerRef, headerRef };
  }, [footerHeight, headerHeight]);

  return (
    <LayoutDimensionsContext.Provider value={value}>
      {children}
    </LayoutDimensionsContext.Provider>
  );
}
