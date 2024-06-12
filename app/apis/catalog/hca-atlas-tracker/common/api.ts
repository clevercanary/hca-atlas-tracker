export enum API {
  ATLAS = "/api/atlases/[atlasId]",
  ATLAS_COMPONENT_ATLAS = "/api/atlases/[atlasId]/component-atlases/[componentAtlasId]",
  ATLAS_COMPONENT_ATLASES = "/api/atlases/[atlasId]/component-atlases",
  ATLAS_SOURCE_DATASET = "/api/atlases/[atlasId]/source-studies/[sourceStudyId]/source-datasets/[sourceDatasetId]",
  ATLAS_SOURCE_DATASETS = "/api/atlases/[atlasId]/source-studies/[sourceStudyId]/source-datasets",
  ATLAS_SOURCE_STUDIES = "/api/atlases/[atlasId]/source-studies",
  ATLAS_SOURCE_STUDY = "/api/atlases/[atlasId]/source-studies/[sourceStudyId]",
  CREATE_ATLAS = "/api/atlases/create",
  CREATE_ATLAS_COMPONENT_ATLAS = "/api/atlases/[atlasId]/component-atlases/create",
  CREATE_ATLAS_SOURCE_STUDY = "/api/atlases/[atlasId]/source-studies/create",
  CREATE_SOURCE_DATASET = "/api/atlases/[atlasId]/source-studies/[sourceStudyId]/source-datasets/create",
  TASKS_COMPLETION_DATES = "/api/tasks/completion-dates",
  USER = "/api/me",
}
