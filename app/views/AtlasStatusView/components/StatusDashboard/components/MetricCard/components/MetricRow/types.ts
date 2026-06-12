import { SvgIconProps } from "@mui/material";
import { ComponentType } from "react";
import { MetricRowModel } from "../../../../types";

export interface Props {
  row: MetricRowModel;
}

export interface RowVariantConfig {
  color: string;
  Icon: ComponentType<SvgIconProps> | null;
}
