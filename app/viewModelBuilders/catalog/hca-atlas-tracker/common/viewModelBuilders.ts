import { STATUS_BADGE_COLOR } from "@clevercanary/data-explorer-ui/lib/components/common/StatusBadge/statusBadge";
import { MetadataValue } from "@clevercanary/data-explorer-ui/lib/components/Index/components/NTagCell/nTagCell";
import { NETWORKS } from "app/apis/catalog/hca-atlas-tracker/common/constants";
import { MetadataValueTuple } from "app/components/common/NTagCell/components/PinnedNTagCell/pinnedNTagCell";
import React from "react";
import {
  ATLAS_STATUS,
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerComponentAtlas,
  HCAAtlasTrackerEntity,
  HCAAtlasTrackerSourceDataset,
  Network,
  NetworkKey,
} from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import * as C from "../../../../components";
import { PLURALIZED_METADATA_LABEL } from "./constants";
import { DISEASE, METADATA_KEY } from "./entities";

/**
 * Build props for the anatomical entity cell component.
 * @param sourceDataset - Source dataset entity.
 * @returns Props to be used for the cell.
 */
export const buildAnatomicalEntity = (
  sourceDataset: HCAAtlasTrackerSourceDataset
): React.ComponentProps<typeof C.NTagCell> => {
  return {
    label: getPluralizedMetadataLabel(METADATA_KEY.ANATOMICAL_ENTITY),
    values: sourceDataset.anatomicalEntity,
  };
};

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
 * Build props for the atlas title cell component.
 * @param entity - Entity.
 * @returns Props to be used for the cell.
 */
export const buildAtlasTitle = (
  entity: HCAAtlasTrackerEntity
): React.ComponentProps<typeof C.Link> => {
  return {
    label: entity.atlasTitle,
    url: `/atlases/${encodeURIComponent(entity.atlasKey)}`,
  };
};

/**
 * Build props for the biological network cell component.
 * @param entity - Entity.
 * @returns Props to be used for the cell.
 */
export const buildBioNetwork = (
  entity: HCAAtlasTrackerEntity
): React.ComponentProps<typeof C.BioNetworkCell> => {
  return {
    networkKey: entity.bioNetwork,
  };
};

/**
 * Build props for the cell count cell component.
 * @param componentAtlas - Component atlas entity.
 * @returns Props to be used for the cell.
 */
export const buildCellCount = (
  componentAtlas: HCAAtlasTrackerComponentAtlas
): React.ComponentProps<typeof C.Cell> => {
  return {
    value: formatCountSize(componentAtlas.cellCount),
  };
};

/**
 * Build props for the explore cell component.
 * @param componentAtlas - Component atlas entity.
 * @returns Props to be used for the cell.
 */
export const buildComponentAtlasExploreLink = (
  componentAtlas: HCAAtlasTrackerComponentAtlas
): React.ComponentProps<typeof C.Link> => {
  return {
    label: "CZ CELLxGENE",
    url: componentAtlas.cxgExploreUrl,
  };
};

/**
 * Build props for the component atlas name cell component.
 * @param componentAtlas - Component atlas entity.
 * @returns Props to be used for the cell.
 */
export const buildComponentAtlasName = (
  componentAtlas: HCAAtlasTrackerComponentAtlas
): React.ComponentProps<typeof C.Cell> => {
  return {
    value: componentAtlas.componentAtlasName,
  };
};

/**
 * Build props for the disease cell component.
 * @param componentAtlas - Component atlas entity.
 * @returns Props to be used for the cell.
 */
export const buildDisease = (
  componentAtlas: HCAAtlasTrackerComponentAtlas
): React.ComponentProps<typeof C.PinnedNTagCell> => {
  return {
    label: getPluralizedMetadataLabel(METADATA_KEY.DISEASE),
    values: partitionMetadataValues(componentAtlas.disease, [DISEASE.NORMAL]),
  };
};

/**
 * Build props for the donor disease cell component.
 * @param sourceDataset - Source dataset entity.
 * @returns Props to be used for the cell.
 */
export const buildDonorDisease = (
  sourceDataset: HCAAtlasTrackerSourceDataset
): React.ComponentProps<typeof C.PinnedNTagCell> => {
  return {
    label: getPluralizedMetadataLabel(METADATA_KEY.DISEASE),
    values: partitionMetadataValues(sourceDataset.donorDisease, [
      DISEASE.NORMAL,
    ]),
  };
};

/**
 * Build props for the estimated cell count cell component.
 * @param sourceDataset - Source dataset entity.
 * @returns Props to be used for the cell.
 */
export const buildEstimatedCellCount = (
  sourceDataset: HCAAtlasTrackerSourceDataset
): React.ComponentProps<typeof C.Cell> => {
  return {
    value: sourceDataset.estimatedCellCount?.toLocaleString(),
  };
};

/**
 * Build props for the "in CELLxGENE" cell component.
 * @param sourceDataset - Source dataset entity.
 * @returns Props to be used for the cell.
 */
export const buildInCellxGene = (
  sourceDataset: HCAAtlasTrackerSourceDataset
): React.ComponentProps<typeof C.Cell> => {
  return {
    value: sourceDataset.inCellxGene,
  };
};

/**
 * Build props for the "is published" cell component.
 * @param sourceDataset - Source dataset entity.
 * @returns Props to be used for the cell.
 */
export const buildIsPublished = (
  sourceDataset: HCAAtlasTrackerSourceDataset
): React.ComponentProps<typeof C.Cell> => {
  return {
    value: sourceDataset.isPublished,
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
 * Build props for the method cell component.
 * @param sourceDataset - Source dataset entity.
 * @returns Props to be used for the cell.
 */
export const buildLibraryConstructionMethod = (
  sourceDataset: HCAAtlasTrackerSourceDataset
): React.ComponentProps<typeof C.NTagCell> => {
  return {
    label: getPluralizedMetadataLabel(METADATA_KEY.LIBRARY_CONSTRUCTION_METHOD),
    values: sourceDataset.libraryConstructionMethod,
  };
};

/**
 * Build props for the project title cell component.
 * @param sourceDataset - Source dataset entity.
 * @returns Props to be used for the cell.
 */
export const buildProjectTitle = (
  sourceDataset: HCAAtlasTrackerSourceDataset
): React.ComponentProps<typeof C.Link> => {
  return {
    label: sourceDataset.projectTitle,
    url: `https://explore.data.humancellatlas.org/projects/${sourceDataset.projectId}`, // TODO different source for base URL?
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
 * Build props for the species cell component.
 * @param sourceDataset - Source dataset entity.
 * @returns Props to be used for the cell.
 */
export const buildSpecies = (
  sourceDataset: HCAAtlasTrackerSourceDataset
): React.ComponentProps<typeof C.NTagCell> => {
  return {
    label: getPluralizedMetadataLabel(METADATA_KEY.SPECIES),
    values: sourceDataset.species,
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
 * Build props for the tissue cell component.
 * @param componentAtlas - Component atlas entity.
 * @returns Props to be used for the cell.
 */
export const buildTissue = (
  componentAtlas: HCAAtlasTrackerComponentAtlas
): React.ComponentProps<typeof C.NTagCell> => {
  return {
    label: getPluralizedMetadataLabel(METADATA_KEY.TISSUE),
    values: componentAtlas.tissue,
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

/**
 * Returns the pluralized metadata label for the specified metadata.
 * @param metadataKey - Metadata key.
 * @returns string label describing the metadata in plural form.
 */
export function getPluralizedMetadataLabel(
  metadataKey: keyof typeof METADATA_KEY
): string {
  return PLURALIZED_METADATA_LABEL[metadataKey];
}

/**
 * Formats count sizes.
 * @param value - Count size.
 * @returns formatted count size as display string.
 */
export function formatCountSize(value: number): string {
  const countSizes = ["k", "M", "G", "T", "P", "E"];

  // Determine count size display value and unit
  let val = value || 0;
  let sigFig = 0;
  while (val >= 1000) {
    val = val / 1000;
    sigFig += 1;
  }

  // No format of count size - tens, hundreds
  if (sigFig === 0) {
    return `${val}`;
  }

  // Format of count size to "n.0k"
  // Round value to precision
  const precision = 1;
  const roundedValue = val.toFixed(precision);
  return `${roundedValue}${countSizes[sigFig - 1]}`;
}

/**
 * Returns metadata values partitioned into pinned values and non-pinned values.
 * @param values - Values to partition.
 * @param pinned - Values to pin.
 * @returns metadata tuple containing pinned values and non-pinned values.
 */
function partitionMetadataValues(
  values: MetadataValue[],
  pinned: MetadataValue[]
): MetadataValueTuple {
  const partitionedValues: MetadataValueTuple = [[], []];
  return values.reduce((acc, value) => {
    if (pinned.includes(value)) {
      acc[0].push(value);
    } else {
      acc[1].push(value);
    }
    return acc;
  }, partitionedValues);
}
