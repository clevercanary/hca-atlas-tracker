import {
  AtlasId,
  ComponentAtlasId,
  SourceDatasetId,
  SourceStudyId,
} from "../apis/catalog/hca-atlas-tracker/common/entities";

export enum FETCH_STATUS {
  CREATED = 201,
  OK = 200,
  NOT_FOUND = 404,
  NOT_MODIFIED = 304,
}

export enum METHOD {
  DELETE = "DELETE",
  GET = "GET",
  PATCH = "PATCH",
  POST = "POST",
  PUT = "PUT",
}

export interface PathParameter {
  atlasId?: AtlasId;
  componentAtlasId?: ComponentAtlasId;
  sourceDatasetId?: SourceDatasetId;
  sourceStudyId?: SourceStudyId;
}
