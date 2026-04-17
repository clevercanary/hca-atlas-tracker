import { StatusBadge } from "@databiosphere/findable-ui/lib/components/common/StatusBadge/statusBadge";
import { JSX } from "react";
import { getAtlasPublishStatusBadgeProps } from "../../../../../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";

export interface AtlasPublishStatusProps {
  publishedAt: string | null;
}

export const AtlasPublishStatus = ({
  publishedAt,
}: AtlasPublishStatusProps): JSX.Element => {
  return <StatusBadge {...getAtlasPublishStatusBadgeProps(publishedAt)} />;
};
