import { renderHook } from "@testing-library/react";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports -- jest.mock requires require()-style import after mock is set up.
import { useRouter } from "next/router";
import { useBackPath } from "../app/components/Layout/components/Detail/components/DetailViewHero/components/BackButton/hooks/UseBackPath/hook";

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

/**
 * Returns a partial NextRouter mock containing only the `query` field that
 * `useBackPath` reads. Cast to the full type so TypeScript accepts it as a
 * mock return value.
 * @param query - Query object to expose on `useRouter()`.
 * @returns Router mock cast to the full NextRouter type.
 */
function routerWith(
  query: Record<string, string | string[] | undefined>,
): ReturnType<typeof useRouter> {
  return { query } as ReturnType<typeof useRouter>;
}

describe("useBackPath", () => {
  beforeEach(() => {
    mockUseRouter.mockReset();
  });

  it("returns undefined when query.from is missing", () => {
    mockUseRouter.mockReturnValue(routerWith({}));
    const { result } = renderHook(() => useBackPath({ atlasId: "abc" }));
    expect(result.current).toBeUndefined();
  });

  it("returns undefined when query.from is an unknown value", () => {
    mockUseRouter.mockReturnValue(routerWith({ from: "BOGUS" }));
    const { result } = renderHook(() => useBackPath({ atlasId: "abc" }));
    expect(result.current).toBeUndefined();
  });

  it("resolves a global ROUTE key with no dynamic segments", () => {
    mockUseRouter.mockReturnValue(routerWith({ from: "SOURCE_DATASETS" }));
    const { result } = renderHook(() => useBackPath({ atlasId: "abc" }));
    expect(result.current).toBe("/source-datasets");
  });

  it("resolves an atlas-scoped ROUTE key against pathParameter.atlasId", () => {
    mockUseRouter.mockReturnValue(
      routerWith({ from: "ATLAS_SOURCE_DATASETS" }),
    );
    const { result } = renderHook(() => useBackPath({ atlasId: "abc-123" }));
    expect(result.current).toBe("/atlases/abc-123/source-datasets");
  });

  it("snapshots origin at first render — subsequent query changes don't repoint backPath", () => {
    // First render with from=SOURCE_DATASETS.
    mockUseRouter.mockReturnValue(routerWith({ from: "SOURCE_DATASETS" }));
    const { rerender, result } = renderHook(() =>
      useBackPath({ atlasId: "abc" }),
    );
    expect(result.current).toBe("/source-datasets");

    // Simulate a tab change that drops `from` from the query.
    mockUseRouter.mockReturnValue(routerWith({}));
    rerender();
    // The ref-captured origin still resolves to the original list.
    expect(result.current).toBe("/source-datasets");
  });
});
