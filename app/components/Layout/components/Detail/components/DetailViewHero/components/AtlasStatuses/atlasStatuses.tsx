import { HCAAtlasTrackerAtlas } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { AtlasPublishStatus } from "@/app/components/Layout/components/Detail/components/DetailViewHero/components/AtlasPublishStatus/atlasPublishStatus";
import { AtlasStatus } from "@/app/components/Layout/components/Detail/components/DetailViewHero/components/AtlasStatus/atlasStatus";
import { JSX } from "react";

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
