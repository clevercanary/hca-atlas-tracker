import {
  APP_BAR_BORDER_WIDTH,
  SEEDED_HEADER_HEIGHT,
} from "@/app/providers/layoutDimensions/constants";
import { SeededLayoutDimensionsProvider } from "@/app/providers/layoutDimensions/provider";
import { HEADER_HEIGHT } from "@databiosphere/findable-ui/lib/components/Layout/components/Header/common/constants";
import { LayoutDimensionsContext } from "@databiosphere/findable-ui/lib/providers/layoutDimensions/context";
import { useLayoutDimensions } from "@databiosphere/findable-ui/lib/providers/layoutDimensions/hook";
import { LayoutDimensionsProvider as UpstreamProvider } from "@databiosphere/findable-ui/lib/providers/layoutDimensions/provider";
import { type LayoutDimensionsContextProps } from "@databiosphere/findable-ui/lib/providers/layoutDimensions/types";
import { renderHook } from "@testing-library/react";
import { type JSX, type ReactNode, createRef } from "react";
import { renderToString } from "react-dom/server";

const FOOTER_REF = createRef<HTMLElement>();
const HEADER_REF = createRef<HTMLElement>();

/**
 * Stands in for findable-ui's `LayoutDimensionsProvider`, supplying the context
 * it would at a given point in its lifecycle. Upstream collapses "not yet
 * measured" into `0` before this provider ever sees it, so an unmeasured header
 * is expressed here the only way it can be: as `0`.
 * @param props - Props.
 * @param props.children - Children components.
 * @param props.footerHeight - Footer height upstream is reporting.
 * @param props.headerHeight - Header height upstream is reporting.
 * @returns Upstream context, stubbed.
 */
function UpstreamStub({
  children,
  footerHeight,
  headerHeight,
}: {
  children: ReactNode;
  footerHeight: number;
  headerHeight: number;
}): JSX.Element {
  return (
    <LayoutDimensionsContext.Provider
      value={{
        dimensions: {
          footer: { height: footerHeight },
          header: { height: headerHeight },
        },
        footerRef: FOOTER_REF,
        headerRef: HEADER_REF,
      }}
    >
      {children}
    </LayoutDimensionsContext.Provider>
  );
}

/**
 * Reads the seeded context the way findable-ui's consumers do.
 * @param heights - Heights upstream is reporting.
 * @param heights.footerHeight - Footer height.
 * @param heights.headerHeight - Header height.
 * @returns What a consumer below the seed sees.
 */
function renderSeeded({
  footerHeight = 0,
  headerHeight = 0,
}: {
  footerHeight?: number;
  headerHeight?: number;
} = {}): LayoutDimensionsContextProps {
  const { result } = renderHook(useLayoutDimensions, {
    wrapper: ({ children }) => (
      <UpstreamStub footerHeight={footerHeight} headerHeight={headerHeight}>
        <SeededLayoutDimensionsProvider>
          {children}
        </SeededLayoutDimensionsProvider>
      </UpstreamStub>
    ),
  });
  return result.current;
}

/**
 * Renders the header offset into an attribute, standing in for the consumers
 * that render it into CSS (`Main`'s margin-top, the explore grid's padding-top).
 * @returns Probe element carrying the offset.
 */
function HeaderOffsetProbe(): JSX.Element {
  const { dimensions } = useLayoutDimensions();
  return <div data-header-offset={dimensions.header.height} />;
}

describe("SEEDED_HEADER_HEIGHT", () => {
  // Asserted as a literal, not as the formula the constant already encodes.
  // Its border half mirrors findable-ui CSS that is not imported
  // (`header.styles.ts`) under a caret range, so a routine upgrade could change
  // it while a formula-shaped assertion stayed green and every first paint was
  // wrong. Failing here is the point: it forces a look.
  it("seeds the header at 57px — the toolbar plus the AppBar's border", () => {
    expect(SEEDED_HEADER_HEIGHT).toEqual(57);
  });

  it("keeps the seed in step with upstream's HEADER_HEIGHT", () => {
    // The toolbar half does track upstream, since it is imported. Independent
    // of the literal above only in a two-step drift: someone hard-codes 57 here
    // and upstream then bumps HEADER_HEIGHT.
    expect(SEEDED_HEADER_HEIGHT).toEqual(HEADER_HEIGHT + APP_BAR_BORDER_WIDTH);
  });
});

describe("SeededLayoutDimensionsProvider", () => {
  it("serves the seed before the observer reports, so SSR and first paint agree", () => {
    expect(renderSeeded().dimensions.header.height).toEqual(
      SEEDED_HEADER_HEIGHT,
    );
  });

  it("prefers the measured height once the observer reports", () => {
    // Deliberately unequal to the seed, and taller: a banner above the toolbar
    // is why a measured header can exceed its resting height.
    expect(renderSeeded({ headerHeight: 88 }).dimensions.header.height).toEqual(
      88,
    );
  });

  it("passes the footer height through untouched, including zero", () => {
    // The footer is not seeded, so whatever upstream reports is what consumers
    // see — the seed must not leak across to it.
    expect(renderSeeded({ footerHeight: 0 }).dimensions.footer.height).toEqual(
      0,
    );
    expect(renderSeeded({ footerHeight: 96 }).dimensions.footer.height).toEqual(
      96,
    );
  });

  it("passes upstream's refs through, so Header and Footer stay observed", () => {
    // The whole reason this nests inside findable-ui's provider rather than
    // replacing it: the elements consumers attach to must be the ones upstream's
    // ResizeObserver watches. Re-providing the context with fresh refs would
    // leave the observer watching nothing and the seed never correcting.
    const { footerRef, headerRef } = renderSeeded();
    expect(footerRef).toBe(FOOTER_REF);
    expect(headerRef).toBe(HEADER_REF);
  });

  it("puts the header offset in the server-rendered markup", () => {
    // The regression this PR exists to prevent (#1543), asserted end-to-end
    // against the real upstream provider: on the server there is no
    // ResizeObserver, so upstream reports 0 and only the seed can put a non-zero
    // offset in the HTML.
    const html = renderToString(
      <UpstreamProvider>
        <SeededLayoutDimensionsProvider>
          <HeaderOffsetProbe />
        </SeededLayoutDimensionsProvider>
      </UpstreamProvider>,
    );
    expect(html).toContain(`data-header-offset="${SEEDED_HEADER_HEIGHT}"`);
  });
});
