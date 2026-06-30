import { ROW_VARIANT, RowVariant } from "../../../../types";
import { RowVariantConfig } from "./types";

// `color` is a theme palette path resolved via the `sx` prop. Rows are plain
// counts with no per-row icon; status is surfaced by the section heading rollup.
export const ROW_VARIANT_CONFIG: Record<RowVariant, RowVariantConfig> = {
  [ROW_VARIANT.PLAIN]: { Icon: null, color: "ink.main" },
};
