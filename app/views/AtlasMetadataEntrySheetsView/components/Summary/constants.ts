import { SVG_ICON_PROPS as MUI_SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { SvgIconProps } from "@mui/material";
import { EntrySheetValidationSummary } from "./entities";

export const SUMMARY_KEY_VALUES: [keyof EntrySheetValidationSummary, string][] =
  [
    ["dataset_count", "Datasets"],
    ["donor_count", "Donors"],
    ["sample_count", "Samples"],
    ["error_count", "Errors"],
  ];

export const SVG_ICON_PROPS: SvgIconProps = {
  fontSize: MUI_SVG_ICON_PROPS.FONT_SIZE.XXSMALL,
};
