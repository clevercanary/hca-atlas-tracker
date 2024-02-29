import { STATUS_BADGE_COLOR } from "@clevercanary/data-explorer-ui/lib/components/common/StatusBadge/statusBadge";
import { NETWORKS } from "app/apis/catalog/hca-atlas-tracker/common/constants";
import React from "react";
import {
  ATLAS_STATUS,
  HCAAtlasTrackerAtlas,
  Network,
  NetworkKey,
} from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import * as C from "../../../../components";

/**
 * Build props for the atlas title and publication cell component.
 * @param atlas - Atlas entity.
 * @returns Props to be used for the cell.
 */
export const buildAtlas = (
  atlas: HCAAtlasTrackerAtlas
): React.ComponentProps<typeof C.AtlasCell> => {
  return {
    label: atlas.atlasTitle,
    subLabel: atlas.publication,
    url: `/atlases/${encodeURIComponent(atlas.atlasKey)}`,
  };
};

/**
 * Build props for the biological network cell component.
 * @param atlas - Atlas entity.
 * @returns Props to be used for the cell.
 */
export const buildBioNetwork = (
  atlas: HCAAtlasTrackerAtlas
): React.ComponentProps<typeof C.BioNetworkCell> => {
  return {
    networkKey: atlas.bioNetwork,
  };
};

/**
 * Build props for the integration lead cell component.
 * @param atlas - Atlas entity.
 * @returns Props to be used for the cell.
 */
export const buildIntegrationLead = (
  atlas: HCAAtlasTrackerAtlas
): React.ComponentProps<typeof C.Cell> => {
  return {
    value: atlas.integrationLead,
  };
};

/**
 * Build props for the publication cell component.
 * @param atlas - Atlas entity.
 * @returns Props to be used for the cell.
 */
export const buildPublication = (
  atlas: HCAAtlasTrackerAtlas
): React.ComponentProps<typeof C.Cell> => {
  return {
    value: atlas.publication,
  };
};

/**
 * Build props for the status cell component.
 * @param atlas - Atlas entity.
 * @returns Props to be used for the cell.
 */
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

/**
 * Build props for the version cell component.
 * @param atlas - Atlas entity.
 * @returns Props to be used for the cell.
 */
export const buildVersion = (
  atlas: HCAAtlasTrackerAtlas
): React.ComponentProps<typeof C.Cell> => {
  return {
    value: atlas.version,
  };
};

/**
 * Attempts to return the bio network with the given key.
 * @param key - Bio network key.
 * @returns bio network, or undefined if not found.
 */
export function getBioNetworkByKey(key: NetworkKey): Network | undefined {
  return NETWORKS.find((network) => network.key === key);
}

/**
 * Returns the bio network name, without the suffix "Network".
 * @param name - Bio network name.
 * @returns name of the bio network.
 */
export function getBioNetworkName(name: string): string {
  return name.replace(/(\sNetwork.*)/gi, "");
}
