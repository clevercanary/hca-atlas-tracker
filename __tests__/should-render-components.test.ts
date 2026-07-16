import { shouldRenderComponents } from "../app/providers/authorization";

/**
 * Parameterized tests for `shouldRenderComponents`, the render gate in
 * `AuthorizationProvider`. This is the linchpin of the #1456 fix: authenticated
 * users must NOT render children until the active-user fetch has settled, so a
 * deep-linked page can't mount and fire its own data fetch before `PUT /api/me`
 * creates the `hat.users` row (which would otherwise 403).
 *
 * Truth table across all reachable states:
 * | isAuthenticated | isSettled | isAuthorized | result      |
 * |-----------------|-----------|--------------|-------------|
 * | false           | any       | any          | render      | public pages, no flash
 * | true            | false     | false        | placeholder | the #1456 fix
 * | true            | true      | true         | render      | authorized user
 * | true            | true      | false        | placeholder | disabled / UNREGISTERED
 */

describe("shouldRenderComponents", () => {
  it.each<
    readonly [
      description: string,
      isSettled: boolean,
      isAuthenticated: boolean,
      isAuthorized: boolean,
      expected: boolean,
    ]
  >([
    [
      "unauthenticated, not settled → render optimistically",
      false,
      false,
      false,
      true,
    ],
    ["unauthenticated, settled → render", true, false, false, true],
    [
      "authenticated, not settled → placeholder (the #1456 fix)",
      false,
      true,
      false,
      false,
    ],
    ["authenticated, settled, authorized → render", true, true, true, true],
    [
      "authenticated, settled, unauthorized → placeholder",
      true,
      true,
      false,
      false,
    ],
  ])(
    "%s",
    (_description, isSettled, isAuthenticated, isAuthorized, expected) => {
      expect(
        shouldRenderComponents(isSettled, isAuthenticated, isAuthorized),
      ).toBe(expected);
    },
  );
});
