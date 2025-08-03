import {
  COLOR,
  VARIANT,
} from "@databiosphere/findable-ui/lib/styles/common/mui/alert";
import { AlertProps } from "@mui/material";

export const ALERT_PROPS: Partial<AlertProps> = {
  elevation: 0,
  icon: false,
  severity: COLOR.ERROR,
  variant: VARIANT.STANDARD,
};

export const METADATA_TIER_1_URL =
  "https://data.humancellatlas.dev.clevercanary.com/metadata/tier-1";
