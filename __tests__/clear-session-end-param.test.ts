import { renderHook } from "@testing-library/react";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

import { useClearSessionEndParam } from "@/app/hooks/UseClearSessionEndParam/hook";
import { SESSION_END_PARAM } from "@/app/routes/constants";
import { INACTIVITY_PARAM } from "@databiosphere/findable-ui/lib/hooks/authentication/session/useSessionTimeout";
import { type NextRouter, useRouter } from "next/router";

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockReplace = jest.fn<
  ReturnType<NextRouter["replace"]>,
  Parameters<NextRouter["replace"]>
>();

/**
 * Points the mocked router at a path. Cast to the full type so TypeScript
 * accepts the partial as a mock return.
 * @param asPath - Path to expose as `asPath`.
 * @returns void.
 */
function setPath(asPath: string): void {
  const router: Partial<NextRouter> = { asPath, replace: mockReplace };
  mockUseRouter.mockReturnValue(router as NextRouter);
}

beforeEach(() => {
  mockReplace.mockReset();
  mockReplace.mockResolvedValue(true);
});

describe("useClearSessionEndParam", () => {
  it("removes the param with a shallow replace", () => {
    // Shallow, so `getServerSideProps` does not re-run and redirect a cookied
    // request back into the loop; a router replace, so findable-ui's route
    // history sees the new URL and sign-in does not return to the old one.
    setPath(`/?${SESSION_END_PARAM}=true`);
    renderHook(() => useClearSessionEndParam());
    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith("/", undefined, { shallow: true });
  });

  it("leaves any other params in place", () => {
    setPath(`/?${SESSION_END_PARAM}=true&foo=bar`);
    renderHook(() => useClearSessionEndParam());
    expect(mockReplace).toHaveBeenCalledWith("/?foo=bar", undefined, {
      shallow: true,
    });
  });

  it.each([["/"], [`/?${INACTIVITY_PARAM}=true`]])(
    "does nothing without the param (%p)",
    (asPath) => {
      // The inactivity param belongs to findable-ui's banner, which clears it.
      setPath(asPath);
      renderHook(() => useClearSessionEndParam());
      expect(mockReplace).not.toHaveBeenCalled();
    },
  );
});
