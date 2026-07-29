import { ATLAS_STATUS } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { getAtlasStatusBadgeProps } from "@/app/viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { StatusBadge } from "@databiosphere/findable-ui/lib/components/common/StatusBadge/statusBadge";
import { JSX } from "react";

export interface AtlasStatusProps {
  atlasStatus: ATLAS_STATUS;
}

export const AtlasStatus = ({
  atlasStatus,
}: AtlasStatusProps): JSX.Element | null => {
  return <StatusBadge {...getAtlasStatusBadgeProps(atlasStatus)} />;
};
