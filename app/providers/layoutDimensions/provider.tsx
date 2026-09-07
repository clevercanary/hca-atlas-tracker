import { LayoutDimensionsContext } from "@databiosphere/findable-ui/lib/providers/layoutDimensions/context";
import { useLayoutDimensions } from "@databiosphere/findable-ui/lib/providers/layoutDimensions/hook";
import { type LayoutDimensionsProviderProps } from "@databiosphere/findable-ui/lib/providers/layoutDimensions/types";
import { type JSX, useMemo } from "react";
import { SEEDED_HEADER_HEIGHT } from "./constants";

/**
 * Re-provides findable-ui's layout dimensions with the header height seeded,
 * so the header offset is in the server-rendered CSS rather than applied on the
 * first client commit.
 *
 * Must be rendered *inside* findable-ui's `LayoutDimensionsProvider`, whose
 * measurement it reads and passes on. It is not a replacement for it: the refs
 * handed to consumers are upstream's own, so `Header` and `Footer` still attach
 * to the elements upstream's `ResizeObserver` watches.
 *
 * Upstream falls back to `0` until that observer reports, and the observer
 * cannot run before the server-rendered paint — so `<main>` ships with
 * `margin-top: 0px`, every consumer of `dimensions` renders once with the
 * header offset missing, and the page jumps ~57px on the first client commit
 * (#1543). No JS-timing fix reaches it: `useLayoutEffect`, measuring earlier,
 * seeding on mount all run after that paint. The fallback itself has to be
 * right, and this supplies it one level down.
 *
 * `||`, not `??`: upstream has already collapsed "not yet measured" into `0` by
 * the time we read it, so the two states are indistinguishable here and a
 * genuinely measured `0` would be re-inflated to the seed. That is acceptable
 * for the header specifically — it is a `position: fixed` AppBar containing a
 * toolbar with a `min-height`, so while it is in the tree it cannot measure `0`
 * — and it is the price of not forking the provider. The footer is passed
 * through untouched, so nothing else inherits the ambiguity.
 * @param props - Provider props.
 * @param props.children - Children components.
 * @returns Layout dimensions provider with the header seeded.
 */
export function SeededLayoutDimensionsProvider({
  children,
}: LayoutDimensionsProviderProps): JSX.Element {
  const { dimensions, footerRef, headerRef } = useLayoutDimensions();
  const { height: footerHeight } = dimensions.footer;
  const { height: headerHeight } = dimensions.header;

  // Keyed on the heights rather than on the context object, which upstream
  // rebuilds every render. Consumers then re-render only when a height actually
  // changes, instead of on every render of the provider above.
  const value = useMemo(
    () => ({
      dimensions: {
        footer: { height: footerHeight },
        header: {
          height: headerHeight || SEEDED_HEADER_HEIGHT,
        },
      },
      footerRef,
      headerRef,
    }),
    [footerHeight, footerRef, headerHeight, headerRef],
  );

  return (
    <LayoutDimensionsContext.Provider value={value}>
      {children}
    </LayoutDimensionsContext.Provider>
  );
}
