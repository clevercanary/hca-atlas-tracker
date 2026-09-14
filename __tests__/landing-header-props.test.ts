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
 * The values are placeholders apart from two. `logo` has to be a real element
 * for `getLandingLogo` to clone. `authenticationEnabled` is a *string* on
 * purpose, and specifically the one the site config passes
 * (`local/config.ts` sets `ROUTE.LANDING`): findable-ui's `getSignInPath`
 * branches on the type, returning the string as the sign-in path and falling
 * back to `/login` otherwise — a route this app doesn't have. With `true` here,
 * hardcoding `authenticationEnabled: true` in `getLandingHeaderProps` passed
 * the whole suite while pointing the Sign In button at a 404, because the
 * assertion was comparing a constant to itself. Don't simplify it back.
 */
const FULL_HEADER: Required<HeaderProps> = {
  actions: "actions",
  announcements: [],
  authenticationEnabled: ROUTE.LANDING,
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
 * Assertions for the kept fields `getLandingHeaderProps` deliberately rewrites,
 * whose value therefore can't be compared to `FULL_HEADER`.
 *
 * A map of assertions rather than a list of names. The partition test derives
 * its key set from these keys, so declaring a newly-kept field "rewritten"
 * means writing the assertion that says what it was rewritten *to*. With a bare
 * list, a field could be parked here to satisfy the partition while nothing
 * checked its value at all — the field could be returned as `undefined` and the
 * suite would still pass, which is the failure this file exists to prevent.
 */
const REWRITTEN_ASSERTIONS = {
  logo: (props: HeaderProps): void => {
    // The configured app-header logo links to the atlas list, which a
    // logged-out visitor bounces off the auth middleware trying to reach.
    // Asserted on the cloned element's props because that rewrite is the whole
    // job of `getLandingLogo` — without this, replacing the logo with
    // `undefined` passed every test in the repo. `src` and `alt` are asserted
    // alongside `link` because re-pointing is a clone, not a rebuild:
    // constructing a new `Logo` with only `link` would satisfy the link
    // assertion while rendering a broken, unlabelled image.
    if (!isValidElement<LogoProps>(props.logo))
      throw new Error("logo is not an element");

    expect(props.logo.props).toMatchObject({
      ...APP_LOGO_PROPS,
      link: ROUTE.LANDING,
    });
  },
  navigation: (props: HeaderProps): void => {
    // The other half of what "kept" means for `navigation`: the field survives,
    // but the main app nav in slots 0 and 1 does not — a logged-out visitor
    // can't reach those routes past the auth middleware.
    expect(props.navigation).toEqual([
      undefined,
      undefined,
      FULL_HEADER.navigation[2],
    ]);
  },
} as const satisfies Partial<
  Record<keyof HeaderProps, (props: HeaderProps) => void>
>;

describe("landing header props", () => {
  it("keeps exactly the fields the classification says it keeps", () => {
    // The link between the declared decision and the code that implements it.
    // Classifying a field `KEPT` without adding it to the returned object fails
    // here, and so does returning one classified `DROPPED`.
    const props = getLandingHeaderProps(FULL_HEADER);

    expect(Object.keys(props).sort()).toEqual(KEPT_FIELDS);
  });

  it("covers every kept field with a value assertion", () => {
    // Keeping a field is two claims: the key is present (asserted above) and
    // the value actually arrives. A key present with an undefined value would
    // satisfy the assertion above while the field still never reaches the
    // header — #1544 one step further down the funnel. This is what makes the
    // value claim cover fields added later: a newly-kept field is in neither
    // `CARRIED_FIELDS` nor `REWRITTEN_ASSERTIONS` and fails here until it is —
    // and landing in either one means an executable value check exists for it.
    expect(
      [...CARRIED_FIELDS, ...Object.keys(REWRITTEN_ASSERTIONS)].sort(),
    ).toEqual(KEPT_FIELDS);
  });

  it.each(CARRIED_FIELDS)("carries %s through unchanged", (field) => {
    const props = getLandingHeaderProps(FULL_HEADER);

    expect(props[field]).toBe(FULL_HEADER[field]);
  });

  it.each(Object.entries(REWRITTEN_ASSERTIONS))(
    "rewrites %s",
    (_field, assertRewritten) => {
      // `hasAssertions` is what makes an entry here cost something. Without it
      // a newly-kept field could be parked in the map as `() => undefined`:
      // that satisfies the partition test above and runs green, leaving the
      // field returned as `undefined` with nothing checking it — the same
      // escape hatch a bare list of field names left open.
      expect.hasAssertions();

      assertRewritten(getLandingHeaderProps(FULL_HEADER));
    },
  );

  it("returns the same shape when there is no header config at all", () => {
    // The parameter is optional and the undefined path builds the result
    // through a different branch (no navigation slot to lift). `AppHeader`
    // guards before calling, so this is a defensive pin on the signature rather
    // than a live path — the key set is a contract either way.
    const props = getLandingHeaderProps(undefined);

    expect(Object.keys(props).sort()).toEqual(KEPT_FIELDS);
  });
});
