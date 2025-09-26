import {
  AtlasId,
  ComponentAtlasId,
  EntrySheetValidationId,
  SourceDatasetId,
  SourceStudyId,
  UserId,
  ValidatorName,
} from "../apis/catalog/hca-atlas-tracker/common/entities";

export enum FETCH_STATUS {
  ACCEPTED = 202,
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
  entrySheetValidationId?: EntrySheetValidationId;
  sourceDatasetId?: SourceDatasetId;
  sourceStudyId?: SourceStudyId;
  userId?: UserId;
  validatorName?: ValidatorName;
}
