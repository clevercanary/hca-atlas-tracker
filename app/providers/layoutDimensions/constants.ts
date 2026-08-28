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
 * `HEADER_HEIGHT`. It is the `sm`-and-up `min-height`: below that breakpoint
 * the toolbar becomes a gapped column with no minimum, so the real footer is
 * taller and content-dependent. The seed is still closer than `0` there, which
 * is the bar it has to clear.
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
 */
export const INITIAL_LAYOUT_DIMENSIONS: LayoutDimensions = {
  footer: { height: FOOTER_HEIGHT },
  header: { height: HEADER_HEIGHT + APP_BAR_BORDER_WIDTH },
};
