import {
  FileId,
  HCAAtlasTrackerAtlas,
} from "../../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";

export interface EntityData {
  atlas: HCAAtlasTrackerAtlas | undefined;
}

export interface Props {
  fileId?: FileId;
}

export interface Response {
  url: string;
}

export interface UseRequestPreSignedURL {
  url?: string;
}
