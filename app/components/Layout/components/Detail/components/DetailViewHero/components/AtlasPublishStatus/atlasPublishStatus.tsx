import { getAtlasPublishStatusBadgeProps } from "@/app/viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { StatusBadge } from "@databiosphere/findable-ui/lib/components/common/StatusBadge/statusBadge";
import { JSX } from "react";

export interface AtlasPublishStatusProps {
  publishedAt: string | null;
}

export const AtlasPublishStatus = ({
  publishedAt,
}: AtlasPublishStatusProps): JSX.Element => {
  return <StatusBadge {...getAtlasPublishStatusBadgeProps(publishedAt)} />;
};
