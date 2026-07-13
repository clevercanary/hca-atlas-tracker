import { ROLE } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { isAdminPath, isRequestAuthorized } from "../app/routes/authorization";
import { ROUTE } from "../app/routes/constants";

describe("isAdminPath", () => {
  it("flags the admin-only paths", () => {
    expect(isAdminPath(ROUTE.CREATE_ATLAS)).toBe(true); // /atlases/create
    expect(isAdminPath(ROUTE.CREATE_USER)).toBe(true); // /team/create
    expect(isAdminPath(ROUTE.FILES_ADMIN)).toBe(true); // /files-admin
  });

  it("does not flag non-admin paths", () => {
    expect(isAdminPath(ROUTE.ATLASES)).toBe(false); // /atlases
    expect(isAdminPath("/team")).toBe(false);
    // Source-study creation is resource-scoped (integration lead), not admin.
    expect(isAdminPath("/atlases/atlas-1/source-studies/create")).toBe(false);
    // Prefix must be a full segment — must not over-match.
    expect(isAdminPath("/atlases/created-by-someone")).toBe(false);
  });
});

describe("isRequestAuthorized", () => {
  it("allows public paths without a session", () => {
    expect(isRequestAuthorized(ROUTE.LANDING, undefined, false)).toBe(true);
  });

  it("denies a non-public path without a session", () => {
    expect(isRequestAuthorized(ROUTE.ATLASES, undefined, false)).toBe(false);
  });

  it("allows an authenticated non-admin on a normal path", () => {
    expect(isRequestAuthorized(ROUTE.ATLASES, ROLE.STAKEHOLDER, true)).toBe(
      true,
    );
  });

  it("allows a CONTENT_ADMIN on admin paths", () => {
    expect(
      isRequestAuthorized(ROUTE.CREATE_ATLAS, ROLE.CONTENT_ADMIN, true),
    ).toBe(true);
    expect(
      isRequestAuthorized(ROUTE.CREATE_USER, ROLE.CONTENT_ADMIN, true),
    ).toBe(true);
    expect(
      isRequestAuthorized(ROUTE.FILES_ADMIN, ROLE.CONTENT_ADMIN, true),
    ).toBe(true);
  });

  it("denies a non-admin (including integration lead) on admin paths", () => {
    expect(
      isRequestAuthorized(ROUTE.CREATE_ATLAS, ROLE.INTEGRATION_LEAD, true),
    ).toBe(false);
    expect(isRequestAuthorized(ROUTE.CREATE_USER, ROLE.STAKEHOLDER, true)).toBe(
      false,
    );
    // Authenticated but no role on the token.
    expect(isRequestAuthorized(ROUTE.FILES_ADMIN, undefined, true)).toBe(false);
  });
});
