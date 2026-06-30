import { ROW_VARIANT, RowVariant } from "../../../../types";
import { InProgressIcon } from "../../../icons/InProgressIcon/inProgressIcon";
import { RowVariantConfig } from "./types";

// `color` is a theme palette path resolved via the `sx` prop (so app-only
// palettes such as "caution.main" work alongside the findable-ui colours).
// Breakdown rows are plain counts; the only per-row indicator is the warning
// applied to a non-zero "Unspecified" remainder.
export const ROW_VARIANT_CONFIG: Record<RowVariant, RowVariantConfig> = {
  [ROW_VARIANT.PLAIN]: { Icon: null, color: "ink.main" },
  [ROW_VARIANT.WARNING]: { Icon: InProgressIcon, color: "caution.main" },
};
