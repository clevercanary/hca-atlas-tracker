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
 * The observer cannot run before the server-rendered paint, so every consumer
 * of the header height — `Main`'s offset, `ContentLayout`'s grid padding,
 * `SidebarPositioner`, and `useLayoutSpacing` (which is where
 * `/[entityListType]` pages get theirs, via `ExploreView` → `IndexView`) —
 * renders once against the fallback. At `0` that paint puts content behind the
 * header and then corrects itself, which is the ~57px jump in #1543.
 *
 * This is the layout at rest, not the whole truth: the announcements banner
 * renders inside the measured AppBar and makes the header taller, and a load
 * carrying `?inactivityTimeout=true` opens that banner from its first client
 * render. The observer still runs and still corrects it. The seed's job is only
 * to replace `0` — a height the header can never legitimately have — with the
 * height it usually has.
 *
 * Only the header is seeded; the footer is passed through from upstream
 * untouched. See the PR for #1543 for why, and for the `useMeasureFilters`
 * follow-up a non-zero header implies.
 */
export const SEEDED_HEADER_HEIGHT = HEADER_HEIGHT + APP_BAR_BORDER_WIDTH;
