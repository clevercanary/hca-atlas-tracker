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
import { type JSX } from "react";

const mockUseResizeObserver = useResizeObserver as jest.MockedFunction<
  typeof useResizeObserver
>;

const FOOTER_TEST_ID = "footer-height";
const HEADER_TEST_ID = "header-height";

/**
 * Reads the layout dimensions from context the way findable-ui's consumers do,
 * rendering them so the test can assert on the DOM.
 * @returns The dimensions as text.
 */
function Probe(): JSX.Element {
  const { dimensions } = useLayoutDimensions();
  return (
    <>
      <span data-testid={HEADER_TEST_ID}>{dimensions.header.height}</span>
      <span data-testid={FOOTER_TEST_ID}>{dimensions.footer.height}</span>
    </>
  );
}

/**
 * Renders the probe inside the provider and returns the dimensions it saw.
 * @returns Header and footer heights read from context.
 */
function renderProvider(): { footer: number; header: number } {
  render(
    <LayoutDimensionsProvider>
      <Probe />
    </LayoutDimensionsProvider>,
  );
  return {
    footer: Number(screen.getByTestId(FOOTER_TEST_ID).textContent),
    header: Number(screen.getByTestId(HEADER_TEST_ID).textContent),
  };
}

describe("INITIAL_LAYOUT_DIMENSIONS", () => {
  // Asserted as literals, not as the formula the constant already encodes.
  // Both mirror findable-ui CSS that is not imported — the AppBar's 1px border
  // (`header.styles.ts`) and the footer toolbar's `min-height`
  // (`footer.styles.ts`) — under a caret range, so a routine upgrade could
  // change either while a formula-shaped assertion stayed green and every first
  // paint was wrong. Failing here is the point: it forces a look.
  it("seeds the header at 57px — the toolbar plus the AppBar's border", () => {
    expect(INITIAL_LAYOUT_DIMENSIONS.header.height).toEqual(57);
  });

  it("keeps the header seed in step with upstream's HEADER_HEIGHT", () => {
    // The toolbar half does track upstream, since it is imported.
    expect(INITIAL_LAYOUT_DIMENSIONS.header.height).toEqual(HEADER_HEIGHT + 1);
  });

  it("seeds the footer at its 56px toolbar", () => {
    expect(INITIAL_LAYOUT_DIMENSIONS.footer.height).toEqual(56);
  });

  it("never seeds zero, the value that produces the jump", () => {
    expect(INITIAL_LAYOUT_DIMENSIONS.header.height).toBeGreaterThan(0);
    expect(INITIAL_LAYOUT_DIMENSIONS.footer.height).toBeGreaterThan(0);
  });
});

describe("LayoutDimensionsProvider", () => {
  beforeEach(() => {
    mockUseResizeObserver.mockReset();
  });

  it("serves the seed before the observer reports, so SSR and first paint agree", () => {
    mockUseResizeObserver.mockReturnValue(undefined);
    expect(renderProvider()).toEqual({
      footer: INITIAL_LAYOUT_DIMENSIONS.footer.height,
      header: INITIAL_LAYOUT_DIMENSIONS.header.height,
    });
  });

  it("prefers the measured height once the observer reports", () => {
    // Distinct values per call, not one shared value: the provider calls the
    // observer for the footer first, so a transposed read would return the
    // footer's height as the header's and a symmetric mock could not tell.
    // A banner above the toolbar is why the header can exceed its seed.
    mockUseResizeObserver
      .mockReturnValueOnce({ height: 88 })
      .mockReturnValueOnce({ height: 105 });
    expect(renderProvider()).toEqual({ footer: 88, header: 105 });
  });

  it("keeps a measured zero rather than falling back to the seed", () => {
    // A genuinely measured 0 (e.g. a hidden footer) is data, not a missing
    // reading, so the fallback must not treat it as absent.
    mockUseResizeObserver
      .mockReturnValueOnce({ height: 0 })
      .mockReturnValueOnce({ height: 0 });
    expect(renderProvider()).toEqual({ footer: 0, header: 0 });
  });

  it("maps each observed element to its own dimension", () => {
    // Guards the wiring itself: only the footer is measured, so a transposed
    // read would surface its height as the header's.
    mockUseResizeObserver
      .mockReturnValueOnce({ height: 42 })
      .mockReturnValueOnce(undefined);
    expect(renderProvider()).toEqual({
      footer: 42,
      header: INITIAL_LAYOUT_DIMENSIONS.header.height,
    });
  });
});
