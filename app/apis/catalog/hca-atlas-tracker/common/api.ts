export enum API {
  ATLAS = "/api/atlases/[atlasId]",
  ATLAS_SOURCE_DATASET = "/api/atlases/[atlasId]/source-studies/[sdId]",
  ATLAS_SOURCE_DATASETS = "/api/atlases/[atlasId]/source-studies",
  CREATE_ATLAS = "/api/atlases/create",
  CREATE_ATLAS_SOURCE_DATASET = "/api/atlases/[atlasId]/source-studies/create",
  TASKS_COMPLETION_DATES = "/api/tasks/completion-dates",
  USER = "/api/me",
}
