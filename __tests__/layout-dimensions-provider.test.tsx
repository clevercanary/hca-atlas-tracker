import { render, screen } from "@testing-library/react";

// `ResizeObserver` is absent in jsdom, and its absence is the point: with no
// observer reading the provider must fall through to the seed, which is exactly
// the state of the server-rendered paint and the first client render.
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
  it("seeds the header at the toolbar plus the AppBar's border", () => {
    // The measured element is the AppBar, so its border counts: 57, not 56.
    expect(INITIAL_LAYOUT_DIMENSIONS.header.height).toEqual(HEADER_HEIGHT + 1);
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
    // A banner above the toolbar makes the AppBar taller than the seed.
    mockUseResizeObserver.mockReturnValue({ height: 105 });
    expect(renderProvider()).toEqual({ footer: 105, header: 105 });
  });

  it("keeps a measured zero rather than falling back to the seed", () => {
    // A genuinely measured 0 (e.g. a hidden footer) is data, not a missing
    // reading, so the fallback must not treat it as absent.
    mockUseResizeObserver.mockReturnValue({ height: 0 });
    expect(renderProvider()).toEqual({ footer: 0, header: 0 });
  });
});
