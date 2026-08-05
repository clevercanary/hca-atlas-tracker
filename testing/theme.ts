import { mergeAppTheme } from "@/app/theme/theme";
import { createAppTheme } from "@databiosphere/findable-ui/lib/theme/theme";

/**
 * App theme for rendering components in tests. Includes the app-only "caution"
 * palette because `mergeAppTheme`'s MuiChip override reads
 * `theme.palette.caution` at build time.
 */
export const TEST_THEME = mergeAppTheme(
  createAppTheme({
    palette: { caution: { light: "#FFEB78", main: "#956F00" } },
  }),
);
