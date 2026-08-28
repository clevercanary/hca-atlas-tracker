import { HEADER_HEIGHT } from "@databiosphere/findable-ui/lib/components/Layout/components/Header/common/constants";
import { type LayoutDimensions } from "@databiosphere/findable-ui/lib/providers/layoutDimensions/types";

/**
 * Width of the AppBar's bottom border (`header.styles.ts` upstream).
 *
 * `headerRef` is attached to the AppBar rather than the Toolbar, so the
 * measured height includes this border — `HEADER_HEIGHT` alone would seed one
 * pixel short and still shift on the first measurement.
 */
const APP_BAR_BORDER_WIDTH = 1;

/**
 * Height of the footer toolbar (`footer.styles.ts` upstream).
 *
 * Hardcoded because upstream sets it inline and exports no equivalent of
 * `HEADER_HEIGHT`, so this value mirrors `footer.styles.ts` and will not track
 * a change to it.
 *
 * It is the `bpUpSm` `min-height`, and `sm` here is **768px** — findable-ui's
 * theme, not MUI's 600. The site-config `BREAKPOINTS` override (`sm: 1024`)
 * does not apply: `_app` scopes that ThemeProvider to the header subtree, and
 * the footer sits outside it. So below 768px — tablets and split-screen
 * laptops, not just phones — the toolbar is a gapped column with no minimum and
 * the real footer is well over 100px, where this seed is badly short. Still
 * closer than `0`, which is the bar it has to clear.
 *
 * Presently inert either way: `dimensions.footer.height` is only read through
 * `useLayoutSpacing`, whose consumers (DataDictionary, IndexView, ResearchView)
 * this app does not render. Worth knowing before one is adopted and this value
 * is inherited as trusted prior art.
 */
const FOOTER_HEIGHT = 56;

/**
 * Dimensions used until the `ResizeObserver` reports, chosen so the
 * server-rendered paint and the first client render agree.
 *
 * Seeding matters because the observer cannot run before the server-rendered
 * paint, so every consumer of these values — `Main`'s offset, `ContentLayout`'s
 * grid padding, `SidebarPositioner`, `useLayoutSpacing` — renders once against
 * the fallback. At `0` that paint puts content behind the header and then
 * corrects itself, which is the ~57px jump in #1543.
 *
 * These are the layout at rest, not the whole truth: the announcements banner
 * renders inside the measured AppBar and makes the header taller, and the
 * footer grows on narrow viewports. The observer still runs and still corrects
 * both. The seed's job is only to replace `0` — a height the layout can never
 * legitimately have — with the height it usually has.
 *
 * One configured case misses on the very first paint rather than at rest: a
 * load carrying `?inactivityTimeout=true` (where a session end lands, see
 * #1544) mounts the session-timeout banner inside the measured AppBar from the
 * first render — `useSessionTimeout` initialises from the query param, and the
 * landing page is server-rendered — so the banner is in the SSR HTML and this
 * seed under-measures until the observer reports. Still strictly better than
 * `0`, and self-correcting; noted so it isn't mistaken for a regression.
 *
 * A note for the upstream fallback-as-prop change: a non-zero seed permanently
 * satisfies `header.height > 0`, which findable-ui's `UseMeasureFilters` passes
 * as `shouldObserve`. Under the zero fallback that flipped false→true after the
 * first measurement; with a seed it is true from first commit and never
 * changes. Latent here (nothing renders DataDictionary), but a consumer using
 * zero as an "unmeasured" sentinel needs a real measured flag instead.
 */
export const INITIAL_LAYOUT_DIMENSIONS: LayoutDimensions = {
  footer: { height: FOOTER_HEIGHT },
  header: { height: HEADER_HEIGHT + APP_BAR_BORDER_WIDTH },
};
