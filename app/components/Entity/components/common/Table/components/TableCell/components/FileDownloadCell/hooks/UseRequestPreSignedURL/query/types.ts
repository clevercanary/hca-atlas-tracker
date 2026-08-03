import {
  type AtlasId,
  type FileId,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type PRESIGNED_URL } from "./constants";

export type QueryKey = [
  typeof PRESIGNED_URL,
  AtlasId | undefined,
  FileId | undefined,
];
