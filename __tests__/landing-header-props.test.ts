import { getLandingHeaderProps } from "@/app/components/Layout/components/Header/utils";
import { type HeaderProps } from "@databiosphere/findable-ui/lib/components/Layout/components/Header/header";

/**
 * Every field on `HeaderProps`, populated.
 *
 * Typed `Required` on purpose: `getLandingHeaderProps` rebuilds its result by
 * naming the fields to keep, so a field added to `HeaderProps` upstream is
 * dropped by omission and vanishes from the landing header with nothing
 * failing — the mechanism that made the inactivity banner unreachable in
 * #1544. `Required` turns that silent drop into a compile error here: the new
 * field has to be added to this fixture, which forces the keep/drop call to be
 * made rather than defaulted into.
 *
 * The values are placeholders. What is under test is which keys survive, not
 * what the header does with them.
 */
const FULL_HEADER: Required<HeaderProps> = {
  actions: "actions",
  announcements: [],
  authenticationEnabled: true,
  className: "class-name",
  logo: "logo",
  navigation: [
    [{ label: "Atlases", url: "/atlases" }],
    [{ label: "Reports", url: "/reports" }],
    [{ label: "Help & Documentation", url: "/help" }],
  ],
  searchEnabled: true,
  searchURL: "/search",
  slogan: "slogan",
  socialMedia: { socials: [] },
};

// The fields the landing header keeps, per the decision recorded on
// `getLandingHeaderProps`. Sorted, so the assertions can compare directly.
const KEPT_FIELDS = [
  "announcements",
  "authenticationEnabled",
  "logo",
  "navigation",
];

describe("landing header props", () => {
  it("keeps exactly the fields the decision names, given every field", () => {
    // The drop list is deny-by-default and documented in prose, which cannot
    // defend against the drift it describes. This is the enforcement: adding a
    // field to the returned literal without revisiting the decision fails here,
    // and so does dropping one that is meant to be kept.
    const props = getLandingHeaderProps(FULL_HEADER);

    expect(Object.keys(props).sort()).toEqual(KEPT_FIELDS);
  });

  it("carries the kept fields through rather than merely declaring them", () => {
    // A key present with an undefined value would satisfy the assertion above
    // while the field still never reaches the header. `logo` is excluded: it is
    // deliberately rewritten by `getLandingLogo`, and `navigation` is asserted
    // separately below because only one slot survives.
    const props = getLandingHeaderProps(FULL_HEADER);

    expect(props.announcements).toBe(FULL_HEADER.announcements);
    expect(props.authenticationEnabled).toBe(FULL_HEADER.authenticationEnabled);
  });

  it("keeps only the Help & Documentation navigation slot", () => {
    // The other half of what "kept" means for `navigation`: the field survives,
    // but the main app nav in slots 0 and 1 does not — a logged-out visitor
    // can't reach those routes past the auth middleware.
    const props = getLandingHeaderProps(FULL_HEADER);

    expect(props.navigation).toEqual([
      undefined,
      undefined,
      FULL_HEADER.navigation[2],
    ]);
  });

  it("returns the same shape when there is no header config at all", () => {
    // `header` is optional at the call site, and the undefined path builds the
    // result through a different branch (no navigation slot to lift). The key
    // set is a contract, so it should not depend on the input.
    const props = getLandingHeaderProps(undefined);

    expect(Object.keys(props).sort()).toEqual(KEPT_FIELDS);
  });
});
