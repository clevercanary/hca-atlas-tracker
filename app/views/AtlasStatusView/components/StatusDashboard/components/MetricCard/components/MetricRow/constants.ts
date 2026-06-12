import { InvalidIcon } from "app/components/common/CustomIcon/components/InvalidIcon/invalidIcon";
import { ValidIcon } from "app/components/common/CustomIcon/components/ValidIcon/validIcon";
import { ROW_VARIANT, RowVariant } from "../../../../types";
import { InProgressIcon } from "../../../icons/InProgressIcon/inProgressIcon";
import { RowVariantConfig } from "./types";

// `color` is a theme palette path resolved via the `sx` prop (so app-only
// palettes such as "caution.main" work alongside the findable-ui colours).
export const ROW_VARIANT_CONFIG: Record<RowVariant, RowVariantConfig> = {
  [ROW_VARIANT.INVALID]: { Icon: InvalidIcon, color: "alert.main" },
  [ROW_VARIANT.PLAIN]: { Icon: null, color: "ink.main" },
  [ROW_VARIANT.VALID]: { Icon: ValidIcon, color: "success.main" },
  [ROW_VARIANT.WARNING]: { Icon: InProgressIcon, color: "caution.main" },
};
