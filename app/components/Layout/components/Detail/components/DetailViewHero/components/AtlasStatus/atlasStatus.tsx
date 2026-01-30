import { JSX } from "react";
import { StatusBadge } from "@databiosphere/findable-ui/lib/components/common/StatusBadge/statusBadge";
import { ATLAS_STATUS } from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { getAtlasStatusBadgeProps } from "../../../../../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";

export interface AtlasStatusProps {
  atlasStatus: ATLAS_STATUS;
}

export const AtlasStatus = ({
  atlasStatus,
}: AtlasStatusProps): JSX.Element | null => {
  return <StatusBadge {...getAtlasStatusBadgeProps(atlasStatus)} />;
};
