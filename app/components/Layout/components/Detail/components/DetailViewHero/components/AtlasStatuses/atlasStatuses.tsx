import { JSX } from "react";
import { HCAAtlasTrackerAtlas } from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { AtlasPublishStatus } from "../AtlasPublishStatus/atlasPublishStatus";
import { AtlasStatus } from "../AtlasStatus/atlasStatus";

export interface AtlasStatusesProps {
  statuses: Pick<HCAAtlasTrackerAtlas, "publishedAt" | "status">;
}

export const AtlasStatuses = ({
  statuses,
}: AtlasStatusesProps): JSX.Element | null => {
  return (
    <>
      <AtlasStatus atlasStatus={statuses.status} />
      <AtlasPublishStatus publishedAt={statuses.publishedAt} />
    </>
  );
};
