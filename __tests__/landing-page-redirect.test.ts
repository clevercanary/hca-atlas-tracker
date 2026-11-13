jest.mock(
  "@/site-config/hca-atlas-tracker/local/authentication/next-auth-config",
);
jest.mock("@/app/views/HomeView/homeView", () => ({
  HomeView: (): null => null,
}));
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));
jest.mock("next-auth/react", () => ({
  getProviders: jest.fn(),
}));
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

import { ROUTE, SESSION_END_PARAM } from "@/app/routes/constants";
import HomePage, { getServerSideProps } from "@/pages/index";
import { INACTIVITY_PARAM } from "@databiosphere/findable-ui/lib/hooks/authentication/session/useSessionTimeout";
import { render } from "@testing-library/react";
import { type GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth";
import { getProviders } from "next-auth/react";
import { type NextRouter, useRouter } from "next/router";
import { type ParsedUrlQuery } from "querystring";
import { createElement } from "react";

const mockGetServerSession = getServerSession as jest.MockedFunction<
  typeof getServerSession
>;
const mockGetProviders = getProviders as jest.MockedFunction<
  typeof getProviders
>;

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockReplace = jest.fn<
  ReturnType<NextRouter["replace"]>,
  Parameters<NextRouter["replace"]>
>();

const SESSION = { expires: "2099-01-01T00:00:00.000Z", user: {} };

/**
 * Runs the landing page's `getServerSideProps` for a query. Only the fields it
 * reads are supplied, so the partial context is cast to the full type.
 * @param query - Request query.
 * @returns The page's server-side result.
 */
function loadLanding(
  query: ParsedUrlQuery,
): ReturnType<typeof getServerSideProps> {
  return getServerSideProps({
    query,
    req: {},
    res: {},
  } as GetServerSidePropsContext);
}

beforeEach(() => {
  mockGetServerSession.mockReset();
  mockGetProviders.mockReset();
  mockGetProviders.mockResolvedValue(null);
  mockReplace.mockReset();
  mockReplace.mockResolvedValue(true);
});

describe("landing page", () => {
  it("redirects a signed-in user to the atlases", async () => {
    mockGetServerSession.mockResolvedValue(SESSION);
    await expect(loadLanding({})).resolves.toEqual({
      redirect: { destination: ROUTE.ATLASES, permanent: false },
    });
  });

  it("renders for a visitor with no session", async () => {
    mockGetServerSession.mockResolvedValue(null);
    await expect(loadLanding({})).resolves.toHaveProperty("props");
  });

  it.each([[INACTIVITY_PARAM], [SESSION_END_PARAM]])(
    "renders a session-end landing carrying %p even with a session cookie",
    async (param) => {
      // The loop breaker: a cookie the client's session read could not see (a
      // CDN forwarding it to pages but not `/api`) must not bounce the tab back
      // to a page that strands it again.
      mockGetServerSession.mockResolvedValue(SESSION);
      await expect(loadLanding({ [param]: "true" })).resolves.toHaveProperty(
        "props",
      );
      // Not read at all, so the landing does not refresh the cookie either.
      expect(mockGetServerSession).not.toHaveBeenCalled();
    },
  );
});

describe("landing page render", () => {
  it("removes the session-end param, so it does not survive sign-in", () => {
    // The wiring, not the hook: `clear-session-end-param` covers how the param
    // is removed, this covers that the landing page does it at all.
    const router: Partial<NextRouter> = {
      asPath: `/?${SESSION_END_PARAM}=true`,
      replace: mockReplace,
    };
    mockUseRouter.mockReturnValue(router as NextRouter);
    render(createElement(HomePage, { providers: [] }));
    expect(mockReplace).toHaveBeenCalledWith("/", undefined, { shallow: true });
  });
});
