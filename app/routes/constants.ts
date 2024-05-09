export const ROUTE = {
  ATLAS: "/atlases/[atlasId]",
  ATLASES: "/atlases",
  CREATE_ATLAS: "/atlases/create",
  CREATE_SOURCE_DATASET: "/atlases/[atlasId]/source-datasets/create",
  LOGIN: "/login",
  REGISTRATION_REQUIRED: "/registration-required",
  SOURCE_DATASET: "/atlases/[atlasId]/source-datasets/[sdId]",
  SOURCE_DATASETS: "/atlases/[atlasId]/source-datasets",
  TASKS: "/tasks",
} as const;
