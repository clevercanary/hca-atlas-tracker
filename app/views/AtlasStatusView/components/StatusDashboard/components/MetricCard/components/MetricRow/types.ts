import { MetricRowModel } from "@/app/views/AtlasStatusView/components/StatusDashboard/types";
import { SvgIconProps } from "@mui/material";
import { ComponentType } from "react";

export interface Props {
  row: MetricRowModel;
}

export interface RowVariantConfig {
  color: string;
  Icon: ComponentType<SvgIconProps> | null;
}

export interface StyledStackProps {
  highlighted?: boolean;
}
