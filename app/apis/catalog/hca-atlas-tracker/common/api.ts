export enum API {
  ATLAS = "/api/atlases/[atlasId]",
  ATLAS_SOURCE_STUDIES = "/api/atlases/[atlasId]/source-studies",
  ATLAS_SOURCE_STUDY = "/api/atlases/[atlasId]/source-studies/[sourceStudyId]",
  CREATE_ATLAS = "/api/atlases/create",
  CREATE_ATLAS_SOURCE_STUDY = "/api/atlases/[atlasId]/source-studies/create",
  TASKS_COMPLETION_DATES = "/api/tasks/completion-dates",
  USER = "/api/me",
}
