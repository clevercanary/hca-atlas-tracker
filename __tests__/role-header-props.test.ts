// The site config reaches an `.mdx` file jest has no transform for, via the
// login terms of service. The copy is irrelevant here; only the header is.
jest.mock("@/app/components/common/MDXContent", () => ({
  LoginTermsOfService: (): null => null,
}));

import { ROLE } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { getRoleHeaderProps } from "@/app/components/Layout/components/Header/utils";
import { ROUTE } from "@/app/routes/constants";
import config from "@/site-config/hca-atlas-tracker/local/config";
import { STAKEHOLDER_ANALOGOUS_ROLES } from "@/testing/constants";
import { type HeaderProps } from "@databiosphere/findable-ui/lib/components/Layout/components/Header/header";

/**
 * The real site header, so the test follows the Team links wherever the config
 * puts them rather than a fixture that could drift from it.
 */
const HEADER: HeaderProps = getConfigHeader();

const NON_ADMIN_ROLES = [
  ...STAKEHOLDER_ANALOGOUS_ROLES,
  ROLE.UNREGISTERED,
  undefined,
] as const;

describe("getRoleHeaderProps", () => {
  it("starts from a config with the Team link at the top level and in a menu", () => {
    expect(getTopLevelUrls(HEADER)).toContain(ROUTE.USERS);
    expect(getMenuItemUrls(HEADER)).toContain(ROUTE.USERS);
  });

  it("keeps every link for a content admin", () => {
    expect(getRoleHeaderProps(HEADER, ROLE.CONTENT_ADMIN)).toEqual(HEADER);
  });

  for (const role of NON_ADMIN_ROLES) {
    describe(`for role ${role ?? "undefined (session not resolved)"}`, () => {
      const headerProps = getRoleHeaderProps(HEADER, role);

      it("removes only the Team link, from the top level and from menus", () => {
        expect(getTopLevelUrls(headerProps)).toEqual(
          getTopLevelUrls(HEADER).filter((url) => url !== ROUTE.USERS),
        );
        expect(getMenuItemUrls(headerProps)).toEqual(
          getMenuItemUrls(HEADER).filter((url) => url !== ROUTE.USERS),
        );
      });

      it("keeps the other header fields", () => {
        expect({ ...headerProps, navigation: undefined }).toEqual({
          ...HEADER,
          navigation: undefined,
        });
      });
    });
  }
});

/**
 * Returns the header from the site config, failing if it has none.
 * @returns The configured header props.
 */
function getConfigHeader(): HeaderProps {
  const header = config.layout?.header;
  if (!header) throw new Error("Site config has no header");
  return header;
}

/**
 * Returns the URLs of every menu item, across all navigation slots.
 * @param header - Header props.
 * @returns Menu item URLs, in order.
 */
function getMenuItemUrls(header: HeaderProps): string[] {
  return (header.navigation ?? []).flatMap((links) =>
    (links ?? []).flatMap((link) =>
      (link.menuItems ?? []).map((item) => item.url),
    ),
  );
}

/**
 * Returns the URLs of the top-level links, across all navigation slots.
 * @param header - Header props.
 * @returns Top-level link URLs, in order.
 */
function getTopLevelUrls(header: HeaderProps): string[] {
  return (header.navigation ?? []).flatMap((links) =>
    (links ?? []).map((link) => link.url),
  );
}
