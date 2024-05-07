export const ROUTE = {
  ATLAS: "/atlases/[atlasId]",
  ATLASES: "/atlases",
  CREATE_ATLAS: "/atlases/create",
  CREATE_SOURCE_DATASET: "/atlases/[atlasId]/source-datasets/create",
  LOGIN: "/login",
  SOURCE_DATASET: "/atlases/[atlasId]/source-datasets/[sdId]",
  SOURCE_DATASETS: "/atlases/[atlasId]/source-datasets",
} as const;
