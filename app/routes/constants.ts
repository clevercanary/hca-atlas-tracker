export const ROUTE = {
  ATLASES: "/atlases",
  CREATE_ATLAS: "/atlases/create",
  CREATE_ATLAS_SOURCE_DATASET: "/atlases/[atlasId]/source-datasets/create",
  EDIT_ATLAS: "/atlases/[atlasId]/edit",
  EDIT_ATLAS_SOURCE_DATASET: "/atlases/[atlasId]/source-datasets/[sdId]/edit",
  LOGIN: "/login",
  VIEW_ATLAS: "/atlases/[atlasId]",
  VIEW_SOURCE_DATASETS: "/atlases/[atlasId]/source-datasets",
} as const;
