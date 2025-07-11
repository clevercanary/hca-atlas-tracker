import { ALERT_PROPS as DX_ALERT_PROPS } from "@databiosphere/findable-ui/lib/components/common/Alert/constants";
import { FluidPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/components/FluidPaper/fluidPaper";
import { SIZE } from "@databiosphere/findable-ui/lib/styles/common/constants/size";
import { AlertProps } from "@mui/material";

export const ALERT_PROPS: AlertProps = {
  ...DX_ALERT_PROPS.STANDARD_INFO,
  component: FluidPaper,
  size: SIZE.LARGE,
};
