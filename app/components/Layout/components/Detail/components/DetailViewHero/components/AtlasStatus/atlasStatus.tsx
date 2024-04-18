import {
  StatusBadge,
  STATUS_BADGE_COLOR,
} from "@databiosphere/findable-ui/lib/components/common/StatusBadge/statusBadge";
import { ATLAS_STATUS } from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";

export interface AtlasStatusProps {
  atlasStatus: ATLAS_STATUS;
}

export const AtlasStatus = ({
  atlasStatus,
}: AtlasStatusProps): JSX.Element | null => {
  return (
    <StatusBadge color={getStatusBadgeColor(atlasStatus)} label={atlasStatus} />
  );
};

/**
 * Returns status badge color from the given atlas status.
 * @param atlasStatus - Atlas status.
 * @returns status badge color.
 */
function getStatusBadgeColor(atlasStatus: ATLAS_STATUS): STATUS_BADGE_COLOR {
  switch (atlasStatus) {
    case ATLAS_STATUS.DRAFT:
      return STATUS_BADGE_COLOR.INFO;
    case ATLAS_STATUS.PUBLIC:
      return STATUS_BADGE_COLOR.SUCCESS;
    case ATLAS_STATUS.REVISION:
      return STATUS_BADGE_COLOR.WARNING;
    default:
      return STATUS_BADGE_COLOR.DEFAULT;
  }
}
