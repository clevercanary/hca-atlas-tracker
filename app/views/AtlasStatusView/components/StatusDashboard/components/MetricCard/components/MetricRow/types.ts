import { type MetricRowModel } from "@/app/views/AtlasStatusView/components/StatusDashboard/types";
import { type SvgIconProps } from "@mui/material";
import { type ComponentType } from "react";

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
