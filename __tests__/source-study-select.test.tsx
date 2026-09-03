import { render, screen, waitFor } from "@testing-library/react";

jest.mock("@databiosphere/findable-ui/lib/auth/hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));
jest.mock("@/app/providers/entity/hook", () => ({
  useEntity: jest.fn(),
}));
jest.mock("@/app/common/utils", () => ({
  ...jest.requireActual("@/app/common/utils"),
  fetchResource: jest.fn(),
}));

import { type HCAAtlasTrackerSourceStudy } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { getSourceStudyCitation } from "@/app/apis/catalog/hca-atlas-tracker/common/utils";
import { fetchResource } from "@/app/common/utils";
import { SourceStudy } from "@/app/components/Form/components/Select/components/SourceStudy/sourceStudy";
import { useEntity } from "@/app/providers/entity/hook";
import { createQueryClientWrapper } from "@/testing/query";
import { createMockResponse } from "@/testing/utils";
import { useAuth } from "@databiosphere/findable-ui/lib/auth/hooks/useAuth";

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseEntity = useEntity as jest.MockedFunction<typeof useEntity>;
const mockFetchResource = fetchResource as jest.MockedFunction<
  typeof fetchResource
>;

const ATLAS_ID = "atlas-1";

// Unpublished study (doi: null) so getSourceStudyCitation follows the
// author/contact path; the expected option text is derived from the same
// helper the component uses, so the assertion never hardcodes the format.
const STUDY = {
  contactEmail: null,
  doi: null,
  id: "source-study-1",
  referenceAuthor: "Test Author",
} as HCAAtlasTrackerSourceStudy;
const STUDY_CITATION = getSourceStudyCitation(STUDY);

/**
 * Build a minimal useAuth() return exposing only isAuthenticated.
 * @param isAuthenticated - Whether the user is authenticated.
 * @returns Mock useAuth return.
 */
function authStateOf(isAuthenticated: boolean): ReturnType<typeof useAuth> {
  return { authState: { isAuthenticated } } as ReturnType<typeof useAuth>;
}

/**
 * Build a minimal useEntity() return exposing a pathParameter with an atlasId.
 * @returns Mock useEntity return.
 */
function entityWithAtlas(): ReturnType<typeof useEntity> {
  return {
    data: {},
    pathParameter: { atlasId: ATLAS_ID },
  } as ReturnType<typeof useEntity>;
}

/**
 * Render the SourceStudy select within a QueryClientProvider. `open` forces the
 * MUI menu to render so its options can be queried.
 * @returns void.
 */
function renderSourceStudy(): void {
  render(<SourceStudy open />, { wrapper: createQueryClientWrapper() });
}

describe("SourceStudy select", () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockUseEntity.mockReset();
    mockFetchResource.mockReset();
  });

  it("fetches source studies on mount and renders them as options", async () => {
    mockUseAuth.mockReturnValue(authStateOf(true));
    mockUseEntity.mockReturnValue(entityWithAtlas());
    mockFetchResource.mockResolvedValue(createMockResponse(200, [STUDY]));

    renderSourceStudy();

    // The Select mounting triggers the lazy fetch (previously dispatched via
    // fetchDataState; now the hook fetches on mount) against the atlas's
    // source-studies endpoint.
    await waitFor(() => expect(mockFetchResource).toHaveBeenCalled());
    const [requestUrl] = mockFetchResource.mock.calls[0];
    expect(requestUrl).toContain(ATLAS_ID);
    expect(requestUrl).toContain("source-studies");

    // The fetched study appears as a selectable option.
    await waitFor(() =>
      expect(screen.queryByText(STUDY_CITATION)).not.toBeNull(),
    );
  });

  it("does not fetch when unauthenticated", () => {
    mockUseAuth.mockReturnValue(authStateOf(false));
    mockUseEntity.mockReturnValue(entityWithAtlas());

    renderSourceStudy();

    expect(mockFetchResource).not.toHaveBeenCalled();
  });
});
