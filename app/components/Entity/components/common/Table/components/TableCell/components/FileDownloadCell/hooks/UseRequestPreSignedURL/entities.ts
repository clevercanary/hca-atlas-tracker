import {
  FileId,
  HCAAtlasTrackerAtlas,
  PresignedUrlInfo,
} from "../../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";

export interface EntityData {
  atlas: HCAAtlasTrackerAtlas | undefined;
}

export interface Props {
  fileId?: FileId;
}

export type Response = PresignedUrlInfo;

export interface UseRequestPreSignedURL {
  filename?: string;
  url?: string;
}
