import { HEADER_HEIGHT } from "@databiosphere/findable-ui/lib/components/Layout/components/Header/common/constants";

/**
 * Thickness of the AppBar's bottom border — CSS `border-width`, which is what a
 * border's thickness is called on every side (`border-bottom: 1px solid` in
 * `header.styles.ts` upstream). Named for the property it mirrors, though what
 * it contributes to here is a height.
 *
 * `headerRef` is attached to the AppBar rather than the Toolbar, so the
 * measured height includes this border — `HEADER_HEIGHT` alone would seed one
 * pixel short and still shift on the first measurement.
 */
export const APP_BAR_BORDER_WIDTH = 1;

/**
 * Header height used until findable-ui's `ResizeObserver` reports, chosen so
 * the server-rendered paint and the first client render agree.
 *
 * Seeding matters because the observer cannot run before the server-rendered
 * paint, so every consumer of the header height — `Main`'s offset,
 * `ContentLayout`'s grid padding, `SidebarPositioner`, and `useLayoutSpacing`
 * (which is where `/[entityListType]` pages get theirs, via `ExploreView` →
 * `IndexView`) — renders once against the fallback. At `0` that paint puts
 * content behind the header and then corrects itself, which is the ~57px jump
 * in #1543.
 *
 * This is the layout at rest, not the whole truth: the announcements banner
 * renders inside the measured AppBar and makes the header taller. The observer
 * still runs and still corrects it. The seed's job is only to replace `0` — a
 * height the header can never legitimately have — with the height it usually
 * has.
 *
 * One configured case misses on the very first paint rather than at rest: a
 * load carrying `?inactivityTimeout=true`, where a session end lands (#1544).
 * `useSessionTimeout` initialises its state from the query param, so the banner
 * is open from its first client render, and findable-ui's `Header` renders
 * `Announcements` as the AppBar's first child — inside `headerRef` — so it
 * grows the measured header and this seed under-measures until the observer
 * reports. Live since #1548 restored `announcements` to the landing header.
 * Still strictly better than `0`, and self-correcting, but worth testing that
 * path rather than trusting the seed on it.
 *
 * The footer is deliberately not seeded — it is passed through from upstream
 * untouched. Its height has no upstream export to track (upstream sets it
 * inline), and the obvious literal is wrong on a large range of viewports: `56`
 * is the `bpUpSm` `min-height`, and `sm` here is **768px** — findable-ui's
 * theme, not MUI's 600, and the site-config `BREAKPOINTS` override (`sm: 1024`)
 * does not apply because `_app` scopes that ThemeProvider to the header subtree
 * while the footer sits outside it. Below 768px — tablets and split-screen
 * laptops, not just phones — the toolbar is a gapped column with no minimum and
 * the real footer runs well over 100px, so a seed of `56` would be roughly half
 * the truth while looking measured. `dimensions.footer.height` *is* read here
 * (`useLayoutSpacing`, on every entity list page), so a seed is not pointless —
 * it just has to be chosen against a real consumer's needs and pinned by a
 * test, which is a separate piece of work.
 *
 * A note for the upstream fallback-as-prop change: a non-zero header
 * permanently satisfies `header.height > 0`, which findable-ui's
 * `useMeasureFilters` passes as `shouldObserve`. Under the zero fallback that
 * flipped false→true after the first measurement; below this provider it is
 * true from the first commit and never changes. Latent here (nothing renders
 * DataDictionary), but a consumer using zero as an "unmeasured" sentinel needs
 * a real measured flag instead.
 */
export const SEEDED_HEADER_HEIGHT = HEADER_HEIGHT + APP_BAR_BORDER_WIDTH;
