import {
  getLandingHeaderProps,
  LANDING_HEADER_FIELD,
  LANDING_HEADER_FIELDS,
} from "@/app/components/Layout/components/Header/utils";
import { ROUTE } from "@/app/routes/constants";
import { Logo } from "@databiosphere/findable-ui/lib/components/Layout/components/Header/components/Content/components/Logo/logo";
import { type HeaderProps } from "@databiosphere/findable-ui/lib/components/Layout/components/Header/header";
import { createElement, isValidElement } from "react";

const APP_LOGO = createElement(Logo, {
  alt: "HCA Atlas Tracker",
  height: 32.5,
  link: ROUTE.ATLASES,
  src: "/images/hcaAtlasTracker.webp",
});

/**
 * Every field on `HeaderProps`, populated.
 *
 * `Required` rather than `HeaderProps`, so a field added upstream has to be
 * given a value here too — otherwise this fixture would keep compiling while
 * silently testing less than it claims to. The compile error that forces the
 * keep/drop decision lives on `LANDING_HEADER_FIELDS` in `utils.ts`; this one
 * only keeps the fixture honest.
 *
 * The values are placeholders apart from `logo`, which has to be a real element
 * for `getLandingLogo` to clone.
 */
const FULL_HEADER: Required<HeaderProps> = {
  actions: "actions",
  announcements: [],
  authenticationEnabled: true,
  className: "class-name",
  logo: APP_LOGO,
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

// Derived from the declaration rather than restated, so the two can't drift:
// this is what `LANDING_HEADER_FIELDS` says should survive.
const KEPT_FIELDS = Object.keys(LANDING_HEADER_FIELDS)
  .filter(
    (field) =>
      LANDING_HEADER_FIELDS[field as keyof HeaderProps] ===
      LANDING_HEADER_FIELD.KEPT,
  )
  .sort();

describe("landing header props", () => {
  it("keeps exactly the fields the classification says it keeps", () => {
    // The link between the declared decision and the code that implements it.
    // Classifying a field `KEPT` without adding it to the returned object fails
    // here, and so does returning one classified `DROPPED`.
    const props = getLandingHeaderProps(FULL_HEADER);

    expect(Object.keys(props).sort()).toEqual(KEPT_FIELDS);
  });

  it("carries the kept fields through rather than merely declaring them", () => {
    // A key present with an undefined value would satisfy the assertion above
    // while the field still never reaches the header. `logo` and `navigation`
    // are deliberately rewritten, so they are asserted separately below.
    const props = getLandingHeaderProps(FULL_HEADER);

    expect(props.announcements).toBe(FULL_HEADER.announcements);
    expect(props.authenticationEnabled).toBe(FULL_HEADER.authenticationEnabled);
  });

  it("re-points the logo at the landing page", () => {
    // The configured app-header logo links to the atlas list, which a logged-out
    // visitor bounces off the auth middleware trying to reach. Asserted on the
    // cloned element's props because that rewrite is the whole job of
    // `getLandingLogo` — without this, replacing the logo with `undefined`
    // passed every test in the repo.
    const { logo } = getLandingHeaderProps(FULL_HEADER);

    if (!isValidElement<{ link: string }>(logo))
      throw new Error("logo is not an element");
    expect(logo.props.link).toBe(ROUTE.LANDING);
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
    // The parameter is optional and the undefined path builds the result
    // through a different branch (no navigation slot to lift). `AppHeader`
    // guards before calling, so this is a defensive pin on the signature rather
    // than a live path — the key set is a contract either way.
    const props = getLandingHeaderProps(undefined);

    expect(Object.keys(props).sort()).toEqual(KEPT_FIELDS);
  });
});
