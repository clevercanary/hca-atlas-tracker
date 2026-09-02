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
 * Deliberately left unseeded.
 *
 * The header seed earns its keep on two counts: it is anchored to an upstream
 * export (`HEADER_HEIGHT`), and something in this app actually reads it. A
 * footer seed has neither. `dimensions.footer.height` is read only through
 * `useLayoutSpacing`, whose consumers — DataDictionary, IndexView, ResearchView
 * — this app does not render, so nothing here benefits from a non-zero value.
 *
 * A previous revision seeded `56`. Do not restore it without a consumer and a
 * test. Upstream sets that height inline and exports no equivalent of
 * `HEADER_HEIGHT`, so the literal cannot track `footer.styles.ts` and no test
 * would notice it going stale. Worse, `56` is the `bpUpSm` `min-height` and
 * `sm` here is **768px** — findable-ui's theme, not MUI's 600, and the
 * site-config `BREAKPOINTS` override (`sm: 1024`) does not apply because `_app`
 * scopes that ThemeProvider to the header subtree while the footer sits outside
 * it. Below 768px — tablets and split-screen laptops, not just phones — the
 * toolbar is a gapped column with no minimum and the real footer runs well over
 * 100px. So the first `useLayoutSpacing` consumer would have silently inherited
 * roughly half the real bottom spacing there, on the strength of a value that
 * looked measured and was not.
 *
 * `0` is not a legitimate footer height either, and a consumer adopted later
 * will want a seed. The point is that it should be chosen against that
 * consumer's needs and pinned by a test, rather than inherited as prior art
 * from a branch that had no consumer at all.
 */
const FOOTER_HEIGHT = 0;

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
 * Only the header is seeded; see `FOOTER_HEIGHT` for why the footer is
 * deliberately left at `0`.
 *
 * The header seed is the layout at rest, not the whole truth: the announcements
 * banner renders inside the measured AppBar and makes the header taller. The
 * observer still runs and still corrects it. The seed's job is only to replace
 * `0` — a height the header can never legitimately have — with the height it
 * usually has.
 *
 * One configured case will miss on the very first paint rather than at rest,
 * though not yet on `main`: a load carrying `?inactivityTimeout=true` (where a
 * session end lands, see #1544). `useSessionTimeout` initialises its state from
 * the query param, so the banner is open from its first client render, and
 * findable-ui's `Header` renders `Announcements` as the AppBar's first child —
 * inside `headerRef` — so it grows the measured header and this seed
 * under-measures until the observer reports.
 *
 * Unreachable as things stand, because `getLandingHeaderProps` drops
 * `announcements` and the landing page is the only page that load can hit
 * (`redirectRootToPath` is `/`, which is in `PUBLIC_PATHS`). #1548 restores
 * `announcements` to the landing header — dropping it is what made the
 * inactivity banner unreachable in the first place — and this becomes live when
 * that merges. Recorded now so the under-measurement isn't then read as a
 * regression in this change; still strictly better than `0`, and
 * self-correcting.
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
