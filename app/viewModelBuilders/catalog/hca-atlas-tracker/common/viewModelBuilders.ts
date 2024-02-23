import { STATUS_BADGE_COLOR } from "@clevercanary/data-explorer-ui/lib/components/common/StatusBadge/statusBadge";
import React from "react";
import {
  ATLAS_STATUS,
  HCAAtlasTrackerAtlas,
} from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import * as C from "../../../../components";

export const buildAtlas = (
  atlas: HCAAtlasTrackerAtlas
): React.ComponentProps<typeof C.AtlasCell> => {
  return {
    label: atlas.atlasTitle,
    subLabel: atlas.publication,
    url: `/atlases/${encodeURIComponent(atlas.atlasTitle)}`, // TODO use actual ID
  };
};

export const buildPublication = (
  atlas: HCAAtlasTrackerAtlas
): React.ComponentProps<typeof C.Cell> => {
  return {
    value: atlas.publication,
  };
};

export const buildBioNetwork = (
  atlas: HCAAtlasTrackerAtlas
): React.ComponentProps<typeof C.Cell> => {
  return {
    value: atlas.bioNetwork,
  };
};

export const buildVersion = (
  atlas: HCAAtlasTrackerAtlas
): React.ComponentProps<typeof C.Cell> => {
  return {
    value: atlas.version,
  };
};

export const buildIntegrationLead = (
  atlas: HCAAtlasTrackerAtlas
): React.ComponentProps<typeof C.Cell> => {
  return {
    value: atlas.integrationLead,
  };
};

export const buildStatus = (
  atlas: HCAAtlasTrackerAtlas
): React.ComponentProps<typeof C.StatusBadge> => {
  let color;
  if (atlas.status === ATLAS_STATUS.PUBLISHED)
    color = STATUS_BADGE_COLOR.SUCCESS;
  else if (atlas.status === ATLAS_STATUS.DRAFT) color = STATUS_BADGE_COLOR.INFO;
  return {
    color,
    label: atlas.status,
  };
};
