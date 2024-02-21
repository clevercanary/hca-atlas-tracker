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
): React.ComponentProps<typeof C.Cell> => {
  return {
    value: atlas.status,
  };
};
