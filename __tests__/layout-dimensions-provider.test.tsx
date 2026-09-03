import { render, screen } from "@testing-library/react";

// Mocked to control what the observer reports. `undefined` is the state of the
// server-rendered paint and the first client render, where the provider must
// fall through to the seed; a value stands in for a later measurement. This is
// load-bearing, not belt-and-braces: with the real hook the Probe never
// attaches the refs, so its effect early-returns and no value could be injected
// at all.
jest.mock("@databiosphere/findable-ui/lib/hooks/useResizeObserver", () => ({
  getBorderBoxSizeHeight: jest.fn(),
  useResizeObserver: jest.fn(),
}));

import { INITIAL_LAYOUT_DIMENSIONS } from "@/app/providers/layoutDimensions/constants";
import { LayoutDimensionsProvider } from "@/app/providers/layoutDimensions/provider";
import { HEADER_HEIGHT } from "@databiosphere/findable-ui/lib/components/Layout/components/Header/common/constants";
import { useResizeObserver } from "@databiosphere/findable-ui/lib/hooks/useResizeObserver";
import { useLayoutDimensions } from "@databiosphere/findable-ui/lib/providers/layoutDimensions/hook";
import { type LayoutDimensionsContextProps } from "@databiosphere/findable-ui/lib/providers/layoutDimensions/types";
import { type JSX, type RefObject, useEffect } from "react";

const mockUseResizeObserver = useResizeObserver as jest.MockedFunction<
  typeof useResizeObserver
>;

const FOOTER_TEST_ID = "footer-height";
const HEADER_TEST_ID = "header-height";

// What the Probe last read from context. A holder rather than a bare binding
// because a component may not reassign an outer variable, and it is filled from
// an effect rather than during render to keep the Probe pure. Lets a test assert
// against the very ref objects the provider handed out, instead of inferring
// which element an observer call meant from the order it arrived in.
const observed: { context?: LayoutDimensionsContextProps } = {};

/**
 * Reads the layout dimensions from context the way findable-ui's consumers do,
 * rendering them so the test can assert on the DOM.
 * @returns The dimensions as text.
 */
function Probe(): JSX.Element {
  const context = useLayoutDimensions();
  const { dimensions } = context;
  useEffect(() => {
    observed.context = context;
  }, [context]);
  return (
    <>
      <span data-testid={HEADER_TEST_ID}>{dimensions.header.height}</span>
      <span data-testid={FOOTER_TEST_ID}>{dimensions.footer.height}</span>
    </>
  );
}

/**
 * Renders the probe inside the provider and returns what it saw: the heights,
 * plus the refs the provider put on context.
 * @returns Heights read from context, and the context's own refs.
 */
function renderProvider(): {
  footer: number;
  footerRef: RefObject<HTMLElement | null>;
  header: number;
  headerRef: RefObject<HTMLElement | null>;
} {
  render(
    <LayoutDimensionsProvider>
      <Probe />
    </LayoutDimensionsProvider>,
  );
  const { context } = observed;
  if (!context) throw new Error("Probe did not render");
  return {
    footer: Number(screen.getByTestId(FOOTER_TEST_ID).textContent),
    footerRef: context.footerRef,
    header: Number(screen.getByTestId(HEADER_TEST_ID).textContent),
    headerRef: context.headerRef,
  };
}

/**
 * Returns the height the observer reported for one specific ref, found by
 * matching the argument each call received rather than by call position.
 * @param ref - Ref to look up.
 * @returns Reported height, or undefined if that ref reported nothing.
 */
function reportedHeightFor(
  ref: RefObject<HTMLElement | null>,
): number | undefined {
  const index = mockUseResizeObserver.mock.calls.findIndex(
    ([observedRef]) => observedRef === ref,
  );
  if (index === -1) throw new Error("Ref was never observed");
  return mockUseResizeObserver.mock.results[index].value?.height;
}

describe("INITIAL_LAYOUT_DIMENSIONS", () => {
  // The header is asserted as a literal, not as the formula the constant
  // already encodes. Its border half mirrors findable-ui CSS that is not
  // imported (`header.styles.ts`) under a caret range, so a routine upgrade
  // could change it while a formula-shaped assertion stayed green and every
  // first paint was wrong. Failing here is the point: it forces a look.
  it("seeds the header at 57px — the toolbar plus the AppBar's border", () => {
    expect(INITIAL_LAYOUT_DIMENSIONS.header.height).toEqual(57);
  });

  it("keeps the header seed in step with upstream's HEADER_HEIGHT", () => {
    // The toolbar half does track upstream, since it is imported.
    expect(INITIAL_LAYOUT_DIMENSIONS.header.height).toEqual(HEADER_HEIGHT + 1);
  });

  it("leaves the footer unseeded, since nothing in this app reads it", () => {
    // Deliberate, and asserted so a `56` cannot drift back in unnoticed: that
    // literal has no upstream export to track and is roughly half the real
    // footer below findable-ui's 768px `sm`, so the first `useLayoutSpacing`
    // consumer would have inherited it as measured-looking prior art. See
    // `FOOTER_HEIGHT`.
    expect(INITIAL_LAYOUT_DIMENSIONS.footer.height).toEqual(0);
  });

  it("never seeds the header at zero, the value that produces the jump", () => {
    expect(INITIAL_LAYOUT_DIMENSIONS.header.height).toBeGreaterThan(0);
  });
});

describe("LayoutDimensionsProvider", () => {
  beforeEach(() => {
    mockUseResizeObserver.mockReset();
    delete observed.context;
  });

  it("serves the seed before the observer reports, so SSR and first paint agree", () => {
    mockUseResizeObserver.mockReturnValue(undefined);
    const { footer, header } = renderProvider();
    expect(footer).toEqual(INITIAL_LAYOUT_DIMENSIONS.footer.height);
    expect(header).toEqual(INITIAL_LAYOUT_DIMENSIONS.header.height);
  });

  it("prefers the measured height once the observer reports", () => {
    // One shared value, deliberately unequal to either seed, so this asserts
    // only what it is named for: a report wins over the fallback. Telling a
    // header/footer transposition apart is the wiring test's job, and doing it
    // there — against the ref each call received — pins any mutation rather
    // than the single transposition that distinct values happened to catch.
    // Keeping both jobs here is what coupled this test to the order the
    // provider declares its two observers in.
    // A banner above the toolbar is why a measured header can exceed its seed.
    mockUseResizeObserver.mockReturnValue({ height: 88 });
    const { footer, header } = renderProvider();
    expect(footer).toEqual(88);
    expect(header).toEqual(88);
  });

  it("keeps a measured zero rather than falling back to the seed", () => {
    // A genuinely measured 0 (e.g. a hidden footer) is data, not a missing
    // reading, so the fallback must not treat it as absent — `??`, not `||`.
    // The header assertion is what carries this: its seed is 57, so a `||`
    // would show. The footer's is vacuous now that its seed is also 0, and is
    // kept only so this starts testing something again if that ever changes.
    // One shared value rather than two `Once`s: those pinned this test to the
    // provider rendering exactly once, so StrictMode or an added state hook
    // would send call 3+ to the `mockReset` default of `undefined` and fail
    // with a misleading "expected 0, got 57" pointing at the fallback.
    mockUseResizeObserver.mockReturnValue({ height: 0 });
    const { footer, header } = renderProvider();
    expect(footer).toEqual(0);
    expect(header).toEqual(0);
  });

  it("maps each observed element to its own dimension", () => {
    // Guards the wiring itself, by asserting against the ref each observer call
    // actually received. Heights alone cannot: the mocked hook ignores its ref
    // argument, so `mockReturnValueOnce` order satisfies the assertions
    // whichever ref was passed — transposing the two reads in the provider left
    // all eight tests green. That transposition is a live bug, since the header
    // offset would then track the footer's taller, content-dependent height and
    // push `<main>`, `ContentGrid` and `scroll-margin-top` down with it.
    //
    // Keying on the argument rather than the call position also means a
    // behaviour-preserving reorder of the provider's two `useResizeObserver`
    // lines stays green, where a position-keyed assertion would fail with a
    // misleading message about heights.
    mockUseResizeObserver
      .mockReturnValueOnce({ height: 42 })
      .mockReturnValueOnce({ height: 99 });
    const { footer, footerRef, header, headerRef } = renderProvider();
    expect(footer).toEqual(reportedHeightFor(footerRef));
    expect(header).toEqual(reportedHeightFor(headerRef));
  });
});
