import { ErrorIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/ErrorIcon/errorIcon";
import { InProgressIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/InProgressIcon/inProgressIcon";
import { SuccessIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/SuccessIcon/successIcon";
import { ChipProps, SvgIconProps } from "@mui/material";
import { ComponentType } from "react";
import {
  BADGE_VARIANT,
  BadgeVariant,
  SECTION_STATUS,
  SectionStatus,
} from "../../types";

export const BADGE_COLOR: Record<BadgeVariant, ChipProps["color"]> = {
  [BADGE_VARIANT.CAUTION]: "caution",
  [BADGE_VARIANT.DEFAULT]: "default",
  [BADGE_VARIANT.ERROR]: "error",
  [BADGE_VARIANT.SUCCESS]: "success",
};

// Badge icon per variant; the icon inherits the chip's colour (currentColor).
// The neutral "default" badge (nothing validated yet) carries no icon.
export const BADGE_ICON: Record<
  BadgeVariant,
  ComponentType<SvgIconProps> | null
> = {
  [BADGE_VARIANT.CAUTION]: InProgressIcon,
  [BADGE_VARIANT.DEFAULT]: null,
  [BADGE_VARIANT.ERROR]: ErrorIcon,
  [BADGE_VARIANT.SUCCESS]: SuccessIcon,
};

// Rollup icon + colour shown on a validation block's heading. `color` is a
// theme palette path resolved via the `sx` prop. PASS green, PENDING amber
// (nothing validated yet — work to do), ERROR red (any invalid).
export const SECTION_STATUS_CONFIG: Record<
  SectionStatus,
  { color: string; Icon: ComponentType<SvgIconProps> }
> = {
  [SECTION_STATUS.ERROR]: { Icon: ErrorIcon, color: "alert.main" },
  [SECTION_STATUS.PASS]: { Icon: SuccessIcon, color: "success.main" },
  [SECTION_STATUS.PENDING]: { Icon: InProgressIcon, color: "caution.main" },
};
