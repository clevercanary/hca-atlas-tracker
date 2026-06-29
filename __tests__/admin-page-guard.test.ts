import { GetServerSidePropsContext } from "next";

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));
jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config",
  () => ({ nextAuthOptions: {} }),
);

import { getServerSession } from "next-auth";
import { ROLE } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { getAdminPageRedirect } from "../app/routes/adminPageGuard";
import { ROUTE } from "../app/routes/constants";

const mockGetServerSession = getServerSession as jest.Mock;

const CONTEXT = { req: {}, res: {} } as unknown as GetServerSidePropsContext;

const EXPECTED_REDIRECT = {
  redirect: { destination: ROUTE.ATLASES, permanent: false },
};

describe("getAdminPageRedirect", () => {
  beforeEach(() => {
    mockGetServerSession.mockReset();
  });

  it("allows a CONTENT_ADMIN (no redirect)", async () => {
    mockGetServerSession.mockResolvedValue({
      expires: "",
      user: { role: ROLE.CONTENT_ADMIN },
    });
    expect(await getAdminPageRedirect(CONTEXT)).toBeNull();
  });

  it("redirects a non-admin role", async () => {
    mockGetServerSession.mockResolvedValue({
      expires: "",
      user: { role: ROLE.INTEGRATION_LEAD },
    });
    expect(await getAdminPageRedirect(CONTEXT)).toEqual(EXPECTED_REDIRECT);
  });

  it("redirects when the session has no role", async () => {
    mockGetServerSession.mockResolvedValue({ expires: "", user: {} });
    expect(await getAdminPageRedirect(CONTEXT)).toEqual(EXPECTED_REDIRECT);
  });

  it("redirects when there is no session", async () => {
    mockGetServerSession.mockResolvedValue(null);
    expect(await getAdminPageRedirect(CONTEXT)).toEqual(EXPECTED_REDIRECT);
  });
});
