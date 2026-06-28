import { renderHook, waitFor } from "@testing-library/react";

jest.mock("@databiosphere/findable-ui/lib/auth/hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));
jest.mock("../app/common/utils", () => ({
  fetchResource: jest.fn(),
  isFetchStatusOk: jest.fn(() => true),
}));

import { useAuth } from "@databiosphere/findable-ui/lib/auth/hooks/useAuth";
import { METHOD } from "../app/common/entities";
import { fetchResource } from "../app/common/utils";
import { FETCH_PROGRESS, useFetchData } from "../app/hooks/useFetchData";

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockFetchResource = fetchResource as jest.MockedFunction<
  typeof fetchResource
>;

const DATA = { id: "1", name: "test" };

/**
 * Build a minimal `useAuth()` return value exposing only the `isAuthenticated`
 * field that `useFetchData` reads.
 * @param isAuthenticated - Whether the user is authenticated.
 * @returns Mock useAuth return.
 */
function authStateOf(isAuthenticated: boolean): ReturnType<typeof useAuth> {
  return { authState: { isAuthenticated } } as ReturnType<typeof useAuth>;
}

/**
 * Resolve `fetchResource` with a minimal OK response yielding `DATA`.
 * @returns void.
 */
function mockOkResponse(): void {
  mockFetchResource.mockResolvedValue({
    json: async () => DATA,
    status: 200,
  } as Response);
}

describe("useFetchData", () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockFetchResource.mockReset();
  });

  it("fetches and exposes data when authenticated", async () => {
    mockUseAuth.mockReturnValue(authStateOf(true));
    mockOkResponse();
    const { result } = renderHook(() => useFetchData("/api/x", METHOD.GET));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(DATA);
    expect(result.current.progress).toBe(FETCH_PROGRESS.COMPLETED);
  });

  it("does not fetch when unauthenticated", () => {
    mockUseAuth.mockReturnValue(authStateOf(false));
    const { result } = renderHook(() => useFetchData("/api/x", METHOD.GET));
    expect(mockFetchResource).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
    expect(result.current.isSuccess).toBe(false);
  });

  it("clears fetched data when the user logs out", async () => {
    // Authenticated: fetch resolves with data.
    mockUseAuth.mockReturnValue(authStateOf(true));
    mockOkResponse();
    const { rerender, result } = renderHook(() =>
      useFetchData("/api/x", METHOD.GET),
    );
    await waitFor(() => expect(result.current.data).toEqual(DATA));

    // Logout: data is cleared on the next render (no longer survives logout).
    mockUseAuth.mockReturnValue(authStateOf(false));
    rerender();
    expect(result.current.data).toBeUndefined();
    expect(result.current.isSuccess).toBe(false);
  });
});
