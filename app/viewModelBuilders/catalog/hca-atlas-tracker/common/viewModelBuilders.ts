import { HCAAtlasTrackerAtlas } from "app/apis/catalog/hca-atlas-tracker/common/entities";
import React from "react";
import * as C from "../../../../components";

export const buildAtlasTitle = (
  atlas: HCAAtlasTrackerAtlas
): React.ComponentProps<typeof C.Link> => {
  return {
    label: atlas.atlasTitle,
    url: "",
  };
};
