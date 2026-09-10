import {
  getLandingHeaderProps,
  LANDING_HEADER_FIELD,
  LANDING_HEADER_FIELDS,
} from "@/app/components/Layout/components/Header/utils";
import { ROUTE } from "@/app/routes/constants";
import {
  Logo,
  type LogoProps,
} from "@databiosphere/findable-ui/lib/components/Layout/components/Header/components/Content/components/Logo/logo";
import { type HeaderProps } from "@databiosphere/findable-ui/lib/components/Layout/components/Header/header";
import { createElement, isValidElement } from "react";

const APP_LOGO_PROPS: LogoProps = {
  alt: "HCA Atlas Tracker",
  height: 32.5,
  link: ROUTE.ATLASES,
  src: "/images/hcaAtlasTracker.webp",
};

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
  logo: createElement(Logo, APP_LOGO_PROPS),
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
// this is what `LANDING_HEADER_FIELDS` says should survive. `Object.entries`
// rather than `Object.keys` because the classification is what's being filtered
// on, which keeps the field name as the plain `string` this is compared against
// and avoids asserting back to `keyof HeaderProps`.
const KEPT_FIELDS = Object.entries(LANDING_HEADER_FIELDS)
  .filter(([, classification]) => classification === LANDING_HEADER_FIELD.KEPT)
  .map(([field]) => field)
  .sort();

/**
 * The kept fields whose value has to arrive unchanged.
 *
 * A narrow tuple rather than a filter over `LANDING_HEADER_FIELDS`, because the
 * value assertions index both `FULL_HEADER` and the result by these keys, and
 * `Object.keys`/`Object.entries` widen them to `string`. The partition test
 * below pins the two tuples against the classification, so a newly-kept field
 * has to be placed in one of them rather than going unasserted.
 */
const CARRIED_FIELDS = [
  "announcements",
  "authenticationEnabled",
] as const satisfies readonly (keyof HeaderProps)[];

/**
 * The kept fields `getLandingHeaderProps` deliberately rewrites, so their value
 * can't be compared to `FULL_HEADER` and is asserted individually instead.
 * Adding a field here is a claim that it has its own assertion below.
 */
const REWRITTEN_FIELDS = [
  "logo",
  "navigation",
] as const satisfies readonly (keyof HeaderProps)[];

describe("landing header props", () => {
  it("keeps exactly the fields the classification says it keeps", () => {
    // The link between the declared decision and the code that implements it.
    // Classifying a field `KEPT` without adding it to the returned object fails
    // here, and so does returning one classified `DROPPED`.
    const props = getLandingHeaderProps(FULL_HEADER);

    expect(Object.keys(props).sort()).toEqual(KEPT_FIELDS);
  });

  it("asserts the value of every kept field, carried through or rewritten", () => {
    // Keeping a field is two claims: the key is present (asserted above) and
    // the value actually arrives. A key present with an undefined value would
    // satisfy the assertion above while the field still never reaches the
    // header — #1544 one step further down the funnel. This is what makes the
    // value claim cover fields added later: a newly-kept field is absent from
    // both tuples and fails here until it's put in one.
    expect([...CARRIED_FIELDS, ...REWRITTEN_FIELDS].sort()).toEqual(
      KEPT_FIELDS,
    );
  });

  it.each(CARRIED_FIELDS)("carries %s through unchanged", (field) => {
    const props = getLandingHeaderProps(FULL_HEADER);

    expect(props[field]).toBe(FULL_HEADER[field]);
  });

  it("re-points the logo at the landing page, keeping its other props", () => {
    // The configured app-header logo links to the atlas list, which a logged-out
    // visitor bounces off the auth middleware trying to reach. Asserted on the
    // cloned element's props because that rewrite is the whole job of
    // `getLandingLogo` — without this, replacing the logo with `undefined`
    // passed every test in the repo. `src` and `alt` are asserted alongside
    // `link` because re-pointing is a clone, not a rebuild: constructing a new
    // `Logo` with only `link` would satisfy the link assertion while rendering
    // a broken, unlabelled image.
    const { logo } = getLandingHeaderProps(FULL_HEADER);

    if (!isValidElement<LogoProps>(logo))
      throw new Error("logo is not an element");
    expect(logo.props).toMatchObject({
      ...APP_LOGO_PROPS,
      link: ROUTE.LANDING,
    });
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
